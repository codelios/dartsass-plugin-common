// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';
import { ILog } from '../src/log';

export function getNullLog(): ILog {
    const _log : ILog = {

        debug(msg: string): any {},

        warning(msg: string): any {},

        appendLine(msg: string): any {},

        clear(): any {},

    };
    return _log;
}

export function getConsoleLog(): ILog {
    const _log : ILog = {

        debug(msg: string): any {
            console.log(`DEBUG: ${msg}`);
        },

        warning(msg: string): any {
            console.log(msg);
        },

        appendLine(msg: string): any {
            console.log(msg);
        },

        clear(): any {},

    };
    return _log;

}

export class BufLog  {

    buf = Buffer.alloc(20);

    appendLine(msg: string): any {

    }

    warning(msg: string): any {

    }

    clear(): any{}

    getInfo(): string {
        let raw = this.buf.toString('utf-8');
        raw = raw.replace(/(\r\n|\n|\r)/gm, "");
        return raw;
    }

}

export function getBufLog(): BufLog {
    const log = new(BufLog);
    return log;
}