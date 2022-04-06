from datetime import datetime
import hashlib
import re
import subprocess
import time
import os.path
import json
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


def m_cli_exec(arg):
    return subprocess.run(f'{m_cli} {arg}', shell=True, capture_output=True, text=True)


def put_log(log):
    print(log)
    try:
        with open(log_file, 'a') as f:
            f.write(f'{datetime.now()} {log}\n')
    except Exception:
        pass


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


try:
    while True:
        time.sleep(5)

        # Get config file
        public_link = ''
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
        except FileNotFoundError as e:
            print(f'Failed to read {config_file}')
            print(e)
            continue
        else:
            public_link = config['public_link']
            del config

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
            print(f'Failed to read {events_file}')
            print(e)
        else:
            for key, value in events.items():
                if not value['command'] in webhooks:
                    webhooks[value['command']] = []
                webhooks[value['command']].append(value)
            del events

        # Trigger automatic webhooks
        control = {}
        try:
            with open(triggers_file, 'r') as f:
                control = json.load(f)
        except FileNotFoundError as e:
            print(f'Failed to read {triggers_file}')
            print(e)

        if 'auto-battery' not in control:
            control['auto-battery'] = ''
        if 'auto-bluetooth-off' not in control:
            control['auto-bluetooth-off'] = ''
        if 'auto-bluetooth-on' not in control:
            control['auto-bluetooth-on'] = ''

        for webhook_command, webhooks_url in webhooks:
            if 'auto-' not in webhook_command:
                continue

            # Execute auto-battery webhooks
            if webhook_command == 'auto-battery':
                status_response = m_cli_exec('battery status')

                # Get battery percentage
                m = re.search(r'(\d+)%', status_response.stdout)
                if m is not None:
                    try:
                        battery_percentage = int(m.group(1))
                    except ValueError as e:
                        put_log(e)

                # Check if the event can be triggered
                battery_threshold = 20
                if (battery_percentage <= battery_threshold) and (control[webhook_command] > battery_threshold):
                    control[webhook_command] = battery_percentage - 1

                    # Trigger all the webhooks
                    for trigger in webhooks_url:
                        # Log webhook trigger
                        log = f'Automatic Webhook Trigger: {trigger["url"]}\n - Action: {trigger["command"]}\n - Status: {battery_percentage}'
                        put_log(log)

                        # Trigger webhook
                        trigger_webhook(
                            trigger['url'], trigger['command'], battery_percentage, status_response.stdout)
                elif (battery_percentage >= battery_threshold) and (control[webhook_command] < battery_threshold):
                    # The battery is not more under the threshold
                    control[webhook_command] = battery_percentage + 1

            # Execute auto-bluetooth-on/off webhooks
            if webhook_command == 'auto-bluetooth-on' or webhook_command == 'auto-bluetooth-off':
                check_status = 'OFF' if 'off' in webhook_command else 'ON'

                status_response = m_cli_exec('bluetooth status')

                # Get bluetooth status
                bluetooth_status = status_response.stdout
                bluetooth_status = bluetooth_status.replace(
                    'Bluetooth:', '').strip()
                if bluetooth_status != 'ON' and bluetooth_status != 'OFF':
                    bluetooth_status = 'OFF'

                # Check if the event can be triggered
                if (bluetooth_status == check_status) and (not control[webhook_command]):
                    control[webhook_command] = True

                    # Trigger all the webhooks
                    for trigger in webhooks_url:
                        # Log webhook trigger
                        log = f'Automatic Webhook Trigger: {trigger["url"]}\n - Action: {trigger["command"]}\n - Status: {bluetooth_status}'
                        put_log(log)

                        # Trigger webhook
                        trigger_webhook(
                            trigger['url'], trigger['command'], bluetooth_status, status_response)
                elif (bluetooth_status != check_status) and (control[webhook_command]):
                    # The bluetooth has been turned on/off again
                    control[webhook_command] = False

        # Update control file
        with open(triggers_file, 'w') as f:
            f.write(json.dumps(control))

        # Get commands history
        command_histories = []
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
                print(f'Failed to read {last_command_file}')
                print(e)

            # Execute commands
            exec_command = command_histories[-1]
            exec_hash = hashlib.md5(exec_command.encode('utf-8')).hexdigest()
            del command_histories

            # print('last_command: ', last_command)
            # print('exec_command: ', exec_command)
            # print('exec_hash: ', exec_hash)

            if (last_command != exec_hash) and (exec_hash not in blacklist):
                cli_command = exec_command.split('|')
                shell_command = f'm {cli_command[-1].strip()}'

                # Save last command
                with open(last_command_file, 'w') as f:
                    f.write(exec_hash)

                # Log execution
                log = f'Executing: {shell_command}\n - Hash: {exec_hash}\n - Last Hash: {last_command}'
                put_log(log)

                # Execute command
                res = subprocess.run(
                    shell_command, shell=True, capture_output=True, text=True)

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
    print('finished.')
except Exception as e:
    print('Unexpected Error.')
    print(type(e))
    print(e)
