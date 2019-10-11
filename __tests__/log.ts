// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';
import { ILog } from '../src/log';

export function getNullLog(): ILog {
    const _log : ILog = {
        info(msg: string): any {},

        appendLine(msg: string): any {},

        error(msg: string): any {},

        clear(): any {},

    };
    return _log;
}

export class BufLog  {

    buf = new Buffer(256);

    info(msg: string): any {
        this.buf.write(msg, msg.length);
    }

    appendLine(msg: string): any {

    }

    error(msg: string): any {

    }

    clear(): any{}

    getInfo(): string {
        return this.buf.toString('utf-8');
    }

}

export function getBufLog(): BufLog {
    const log = new(BufLog);
    return log;
}