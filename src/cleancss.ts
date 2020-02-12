// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { ILog } from './log';
import { doTransform } from './transform';
var CleanCSS = require('clean-css');


const Options = {

};

export class CleanCSSMinifier {



    constructor() {
    }

    public minify(src: string, encoding: string, target: string, fnTransform: (value: string) => Promise<string>, _log: ILog): Promise<number> {
        return doTransform(src, encoding, target, _log,
            (contents: string) => {
                return new Promise<string>(function(resolve, reject) {
                    fnTransform(contents).then(
                        (value: string) => {
                            const data = new CleanCSS(Options).minify(value);
                            const result = data.styles;
                            _log.debug(`src: ${src}, tgt: ${target}, data length: ${result.length} bytes`);
                            resolve(result);
                        },
                        err => reject(err)
                    )
                });
            }
        );
    }
}