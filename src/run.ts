// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';
import { ILog } from './log';
import * as child from 'child_process';
import { SIGINT } from 'constants';

export interface ProcessOutput {
   
    pid: number;

    killed: boolean;
}

export function Run(cmd: string, args: string[], _log: ILog) : Promise<string> {
    return new Promise(function(resolve, reject) {
        var output = '';
        var prc = child.spawn(cmd,  args);
        prc.stdout.setEncoding('utf8');
        prc.stdout.on('data', function(data: any) {
            _log.appendLine(`${data}`);
            output = data;
        });
        prc.stderr.setEncoding('utf8');
        prc.stderr.on('data', function(data: any) {
            _log.appendLine(`Error: ${data}`);
            _log.warning(`${data}`);
        });
        prc.on('exit', function(code: any) {
            if (code === 0) {
                resolve(removeLineBreaks(output));
            } else {
                reject(code);
            }
        });
    })
}

export function RunDetached(cmd: string, cwd: string, args: string[], _log: ILog) : Promise<ProcessOutput> {
    return new Promise(function(resolve, reject) {
        const prc = child.spawn(cmd,  args, {
            cwd: cwd,
            detached: true,
            stdio: 'ignore',
            shell: false,
            windowsHide: true,
        });
        prc.unref(); // Parent should not be waiting for the child process at all
        if (prc.killed) {
            _log.warning(`Detached Process ${cmd} killed`);
        } else {
            _log.appendLine(`Detached process ${cmd} launched with pid ${prc.pid}`);
        }
        if (prc.stdout) {
            prc.stdout.setEncoding('utf8');
            prc.stdout.on('data', function(data: any) {
                _log.appendLine(`Output: ${data}`);
            });
        }
        if (prc.stderr) {
            prc.stderr.setEncoding('utf8');
            prc.stderr.on('data', function(data: any) {
                _log.warning(`${data}`);
            });
        }
        const processOutput: ProcessOutput = {
            pid: prc.pid,
            killed: prc.killed
        }
        resolve(processOutput);
    })
}

export function removeLineBreaks(value: string): string {
    return value.replace(/(\r\n|\n|\r)/gm, "");
}

export function killProcess(pid: number) {
    process.kill(-pid, SIGINT);
}
