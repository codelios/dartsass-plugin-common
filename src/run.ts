// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';
import { ILog } from './log';
const { spawn } = require('child_process');

export function Run(cmd: string, args: string[], _log: ILog) : Promise<string> {
    return new Promise(function(resolve, reject) {
        var output = '';
        var prc = spawn(cmd,  args);
        prc.stdout.setEncoding('utf8');
        prc.stdout.on('data', function(data: any) {
            output = data;
        });
        prc.stderr.setEncoding('utf8');
        prc.stderr.on('data', function(data: any) {
            _log.appendLine(data);
            reject(data);
        });
        prc.on('exit', function(code: any) {
            resolve(removeLineBreaks(output));
        });
    })
}

export function removeLineBreaks(value: string): string {
    return value.replace(/(\r\n|\n|\r)/gm, "");
}