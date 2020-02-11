// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { ILog } from './log';

export class CleanCSSMinifier {


    constructor() {
    }

    public minify(src: string, target: string, _log: ILog): any {
        _log.appendLine(`About to minify ${src} to ${target}`);

    }


}