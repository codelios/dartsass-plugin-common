// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';

const { spawn } = require('child_process');

export function Run(cmd: string, args: string[]) {
    var prc = spawn(cmd,  args);
    prc.stdout.setEncoding('utf8');
    prc.stdout.on('data', function (data: any) {
        var str = data.toString()
        var lines = str.split(/(\r?\n)/g);
        console.log(lines.join(""));
    });

    prc.on('close', function (code: any) {
        console.log('process exit code ' + code);
    });
}