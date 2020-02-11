// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { ILog } from './log';
import { doMinify } from './minifier';
var CleanCSS = require('clean-css');


const Options = {

};

export class CleanCSSMinifier {



    constructor() {
    }

    public minify(src: string, encoding: string, target: string, _log: ILog): Promise<boolean> {
        return doMinify(src, encoding, target, _log,
            (contents) => {
                const data = new CleanCSS(Options).minify(contents);
                _log.debug(`src: ${src}, tgt: ${target}, data: ${data.styles}`);
                return data.styles;
            }
            );
    }
}