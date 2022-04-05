import hashlib
import subprocess
import time
import os.path
import json
from urllib.error import URLError
import urllib.request
from blacklist import blacklist

config_file = os.path.expanduser('~/.mic_config.json')
last_command_file = os.path.join(os.path.dirname(__file__), 'last_command')
log_file = os.path.join(os.path.dirname(__file__), 'commands.log')

try:
    while True:
        # Get config file
        with open(config_file, 'r') as f:
            config = json.load(f)

        config['public_link'] = config['public_link'].replace('?dl=0', '')
        config['public_link'] = config['public_link'].replace(
            'https://www.dropbox.com/',
            'https://dl.dropboxusercontent.com/'
        )

        # Get webhook events
        # TODO

        # Trigger automatic webhooks
        # TODO

        # Get commands history
        command_histories = []
        try:
            with urllib.request.urlopen(config['public_link']) as f:
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
            except FileNotFoundError:
                print('No file: ', last_command_file)

            # Execute commands
            exec_command = command_histories[-1]
            exec_hash = hashlib.md5(exec_command.encode('utf-8')).hexdigest()

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
                print(log)
                with open(log_file, 'a') as f:
                    f.write(f'{log}\n')

                # Execute command
                response = subprocess.run(shell_command, shell=True)

                # Log response
                log = f'{exec_hash} Response: {response}'
                print(log)
                with open(log_file, 'a') as f:
                    f.write(f'{log}\n')

                # Trigger Webhook event if exists
                arguments = cli_command[1].split(' ')
                action = arguments[0].strip()

        time.sleep(5)
except KeyboardInterrupt:
    print('finished.')
