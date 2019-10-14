// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';
import { ILog } from '../src/log';

export function getNullLog(): ILog {
    const _log : ILog = {

        appendLine(msg: string): any {},

        clear(): any {},

    };
    return _log;
}

export class BufLog  {

    buf = Buffer.alloc(256);

    appendLine(msg: string): any {

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