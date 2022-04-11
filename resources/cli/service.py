from datetime import datetime
import hashlib
import re
import subprocess
# import time
import os.path
import json
import sys
from urllib.error import URLError
import urllib.request
import urllib.parse
from blacklist import blacklist

config_file = os.path.expanduser('~/.mic_config.json')
events_file = os.path.expanduser('~/.mic_events.json')
triggers_file = os.path.expanduser('~/.mic_triggers_control.json')
last_command_file = os.path.join(os.path.dirname(__file__), 'last_command')
log_file = os.path.join(os.path.dirname(__file__), 'commands.log')
m_cli = os.path.join(os.path.dirname(__file__),
                     *['vendors', 'm-cli-master', 'm'])


def put_log(log):
    print(log)
    try:
        with open(log_file, 'a') as f:
            f.write(f'{datetime.now()} {log}\n')
    except Exception:
        pass


def m_cli_exec(arg):
    return subprocess.run(f'{m_cli} {arg}', shell=True, capture_output=True, text=True)


def trigger_webhook(url, value1, value2, value3):
    parameters = {
        'value1': value1,
        'value2': value2,
        'value3': value3
    }

    delimiter = '&' if '?' in url else '?'
    webhook_url = f'{url}{delimiter}{urllib.parse.urlencode(parameters)}'

    try:
        with urllib.request.urlopen(webhook_url):
            pass
    except URLError as e:
        if hasattr(e, 'reason'):
            put_log(f'We failed to reach a server.\nReason: {e.reason}')
        elif hasattr(e, 'code'):
            put_log(
                f"The server couldn't fulfill the request.\nError code: {e.code}")


def main(argv):
    # put_log('main start')
    try:
        # while True:
        # time.sleep(5)

        # Get config file
        public_link = ''
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
                public_link = config['publicLink']
                del config
        except FileNotFoundError as e:
            put_log(f'Failed to read {config_file}')
            put_log(e)
        else:
            public_link = public_link.replace('?dl=0', '')
            public_link = public_link.replace(
                'https://www.dropbox.com/',
                'https://dl.dropboxusercontent.com/'
            )

        # Get webhook events
        webhooks = {}
        try:
            with open(events_file, 'r') as f:
                events = json.load(f)
        except FileNotFoundError as e:
            put_log(f'Failed to read {events_file}')
            put_log(e)
        else:
            for value in events:
                if not value['trigger'] in webhooks:
                    webhooks[value['trigger']] = []
                webhooks[value['trigger']].append(value['url'])
            del events

        # print(webhooks)

        # Trigger automatic webhooks
        control = {}
        try:
            with open(triggers_file, 'r') as f:
                control = json.load(f)
        except FileNotFoundError as e:
            put_log(f'Failed to read {triggers_file}')
            put_log(e)

        if 'auto-battery' not in control:
            control['auto-battery'] = ''
        if 'auto-bluetooth-off' not in control:
            control['auto-bluetooth-off'] = ''
        if 'auto-bluetooth-on' not in control:
            control['auto-bluetooth-on'] = ''

        for webhook_trigger, webhooks_url in webhooks.items():
            if 'auto-' not in webhook_trigger:
                continue

            # Execute auto-battery webhooks
            if webhook_trigger == 'auto-battery':
                status_response = m_cli_exec('battery status')

                # Get battery percentage
                m = re.search(r'(\d+)%', status_response.stdout)
                if m is not None:
                    try:
                        battery_percentage = int(m.group(1))
                    except ValueError as e:
                        put_log(e)
                else:
                    battery_percentage = None

                # Check if the event can be triggered
                if battery_percentage:
                    battery_threshold = 20
                    if (battery_percentage <= battery_threshold) and (control[webhook_trigger] > battery_threshold):
                        control[webhook_trigger] = battery_percentage - 1

                        # Trigger all the webhooks
                        for trigger in webhooks_url:
                            # Log webhook trigger
                            log = f'Automatic Webhook Trigger: {trigger["url"]}\n - Action: {trigger["trigger"]}\n - Status: {battery_percentage}'
                            put_log(log)

                            # Trigger webhook
                            trigger_webhook(
                                trigger['url'], trigger['trigger'], battery_percentage, status_response.stdout)
                    elif (battery_percentage >= battery_threshold) and (control[webhook_trigger] < battery_threshold):
                        # The battery is not more under the threshold
                        control[webhook_trigger] = battery_percentage + 1

            # Execute auto-bluetooth-on/off webhooks
            if webhook_trigger == 'auto-bluetooth-on' or webhook_trigger == 'auto-bluetooth-off':
                check_status = 'OFF' if 'off' in webhook_trigger else 'ON'

                status_response = m_cli_exec('bluetooth status')

                # Get bluetooth status
                bluetooth_status = status_response.stdout
                bluetooth_status = bluetooth_status.replace(
                    'Bluetooth:', '').strip()
                if bluetooth_status != 'ON' and bluetooth_status != 'OFF':
                    bluetooth_status = 'OFF'

                # Check if the event can be triggered
                if (bluetooth_status == check_status) and (not control[webhook_trigger]):
                    control[webhook_trigger] = True

                    # Trigger all the webhooks
                    for trigger in webhooks_url:
                        # Log webhook trigger
                        log = f'Automatic Webhook Trigger: {trigger["url"]}\n - Action: {trigger["trigger"]}\n - Status: {bluetooth_status}'
                        put_log(log)

                        # Trigger webhook
                        trigger_webhook(
                            trigger['url'], trigger['trigger'], bluetooth_status, status_response)
                elif (bluetooth_status != check_status) and (control[webhook_trigger]):
                    # The bluetooth has been turned on/off again
                    control[webhook_trigger] = False

        # Update control file
        with open(triggers_file, 'w') as f:
            f.write(json.dumps(control))

        # Get commands history
        command_histories = []
        if public_link:
            try:
                with urllib.request.urlopen(public_link) as f:
                    command_histories = f.read().decode('utf-8').strip().splitlines()
            except URLError as e:
                if hasattr(e, 'reason'):
                    print('We failed to reach a server.')
                    print('Reason: ', e.reason)
                elif hasattr(e, 'code'):
                    print('The server couldn\'t fulfill the request.')
                    print('Error code: ', e.code)

        if command_histories:
            # Get last command
            last_command = ''
            try:
                with open(last_command_file, 'r') as f:
                    last_command = f.read().strip()
            except FileNotFoundError as e:
                put_log(f'Failed to read {last_command_file}')
                put_log(e)

            # Execute commands
            exec_command = command_histories[-1]
            exec_hash = hashlib.md5(exec_command.encode('utf-8')).hexdigest()
            del command_histories

            # print('last_command: ', last_command)
            # print('exec_command: ', exec_command)
            # print('exec_hash: ', exec_hash)

            if (last_command != exec_hash) and (exec_hash not in blacklist):
                cli_command = exec_command.split('|')
                triggered_at = cli_command[0].strip()
                arg = cli_command[-1].strip()

                # Save last command
                with open(last_command_file, 'w') as f:
                    f.write(exec_hash)

                m = re.match(
                    r'\w+ \d{2}, \d{4} at \d{2}:\d{2}(AM|PM)', triggered_at)
                if m:
                    triggered_at = datetime.strptime(
                        triggered_at, '%B %d, %Y at %I:%M%p')
                    timediff = datetime.now() - triggered_at
                else:
                    timediff = None

                # Log execution
                time_log = ''
                if timediff:
                    time_log = f'\n - TriggeredAt: {timediff.seconds}s ago'
                log = f'Executing: {arg}\n - Hash: {exec_hash}\n - Last Hash: {last_command}{time_log}'
                put_log(log)

                if timediff and timediff.seconds > 60 * 10:
                    log = f'{exec_hash} Skip: More than 10 minutes ago. Command is skipped.'
                    put_log(log)
                    return 0

                # Execute command
                res = m_cli_exec(arg)

                # Log response
                if res.returncode != 0:
                    log = f'{exec_hash} Error: {res.stderr}'
                else:
                    log = f'{exec_hash} Success: {res.stdout}'
                put_log(log)

                # Trigger Webhook event if exists
                arguments = cli_command[1].split(' ')
                action = arguments[0].strip()

                if (action in webhooks) and (webhooks[action]):
                    for webhook in webhooks[action]:
                        # Log webhook event
                        log = f'Webhook Event: {webhook}\n - Action: {action}\n - Arguments: {arguments}'
                        put_log(log)

                        # Call webhook event
                        parameters = {
                            # Executed action
                            'value1': action,
                            # Arguments
                            'value2': ' '.join(arg for arg in arguments),
                            # Command response
                            'value3': res.stdout
                        }

                        delimiter = '&' if '?' in webhook["url"] else '?'
                        url = f'{webhook["url"]}{delimiter}{urllib.parse.urlencode(parameters)}'

                        try:
                            with urllib.request.urlopen(url) as f:
                                pass
                        except URLError as e:
                            if hasattr(e, 'reason'):
                                print('We failed to reach a server.')
                                print('Reason: ', e.reason)
                            elif hasattr(e, 'code'):
                                print('The server couldn\'t fulfill the request.')
                                print('Error code: ', e.code)

    except KeyboardInterrupt:
        put_log('KeyboardInterrupt.')
    except Exception as e:
        put_log('Unexpected Error.')
        put_log(type(e))
        put_log(e)

    # put_log('main finish')

    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
