// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';
import { ILog } from './log';
const { spawn } = require('child_process');

export function Run(cmd: string, args: string[], _log: ILog) : Promise<string> {
    return new Promise(function(resolve, reject) {
        var buf = Buffer.from('');
        var prc = spawn(cmd,  args);
        prc.stdout.setEncoding('utf8');
        prc.stdout.on('data', function(data: any) {
            buf.write(data, data.length);
        });
        prc.stderr.setEncoding('utf8');
        prc.stderr.on('data', function(data: any) {
            _log.appendLine(data);
        });
        prc.on('exit', function(code: any) {
            resolve(buf.toString());
        });
    })
}