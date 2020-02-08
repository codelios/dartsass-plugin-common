// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';
import { ILog } from './log';
import * as child from 'child_process';
import * as os from 'os';
import { SIGINT } from 'constants';
import { getRelativeDirectory, doesContainSpaces } from './target';

const NoWindowsSpaceInPath = `
    Given Operating System is windows and the cmd path contains a space. 
    
    Please use a cmd with no space in its path.
`;

export interface ProcessOutput {
   
    pid: number;

    killed: boolean;
}

export function isWindows(): boolean {
    return (os.platform() === 'win32'); 
}

export function Run(cmd: string, args: string[], cwd: string, _log: ILog, debug: boolean) : Promise<string> {
    return new Promise(function(resolve, reject) {
        const relativeCmd = getRelativeDirectory(cwd, cmd);
        var output = '';
        if (debug) {
            _log.appendLine(`Run: Cwd: ${cwd}. Exec: ${relativeCmd} ${args.join('  ')}`);
        }
        if (isWindows() && doesContainSpaces(relativeCmd)) {
            reject(`${NoWindowsSpaceInPath}: ${relativeCmd}`);
        }
        var prc = child.spawn(relativeCmd,  args, {
            cwd: cwd,
            shell: false,
            windowsHide: true,
        });
        if (prc.killed) {
            _log.warning(`Run: Process ${cmd} killed. pid - ${prc.pid}`);
            reject(`Run: Process ${cmd} killed. pid - ${prc.pid}`);
        } else if (prc.pid === null || prc.pid === undefined) {
            _log.warning(`Run: process ${cmd} did not launch correctly. pid is null / undefined - ${prc.pid}`);
            reject(`Run: process ${cmd} did not launch correctly. pid is null / undefined - ${prc.pid}`);
        }        
        prc.stdout.setEncoding('utf8');
        prc.stdout.on('data', function(data: any) {
            _log.appendLine(`${data}`);
            output = data;
        });
        prc.stderr.setEncoding('utf8');
        prc.stderr.on('data', function(data: any) {
            _log.appendLine(`stderr: ${data}`);
        });
        prc.on('exit', function(code: any) {
            if (code === 0) {
                resolve(removeLineBreaks(output));
            } else {
                reject(`Process exited with code: ${code}`);
            }
        });
    })
}

export function RunDetached(cmd: string, cwd: string, args: string[], _log: ILog) : Promise<ProcessOutput> {
    return new Promise(function(resolve, reject) {
        const relativeCmd = getRelativeDirectory(cwd, cmd);
        _log.appendLine(`RunDetached: Cwd: ${cwd}. Exec: ${relativeCmd} ${args.join('  ')}`);
        if (isWindows() && doesContainSpaces(relativeCmd)) {
            reject(`${NoWindowsSpaceInPath}: ${relativeCmd}`);
        }
        const prc = child.spawn(relativeCmd,  args, {
            cwd: cwd,
            detached: true,
            stdio: 'ignore',
            shell: false,
            windowsHide: true,
        });
        prc.unref(); // Parent should not be waiting for the child process at all
        if (prc.killed) {
            _log.warning(`Detached Process ${cmd} killed. pid - ${prc.pid}`);
            reject(`Detached Process ${cmd} killed. pid - ${prc.pid}`);
        } else if (prc.pid === null || prc.pid === undefined) {
            _log.warning(`Detached process ${cmd} did not launch correctly. pid is null / undefined - ${prc.pid}`);
            reject(`Detached process ${cmd} did not launch correctly. pid is null / undefined - ${prc.pid}`);
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
                _log.appendLine(`stderr: ${data}`);
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
