// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';

export interface ILog {

    debug(msg: string): any;

    warning(msg: string): any;

    appendLine(msg: string): any;

    clear(): any
}
