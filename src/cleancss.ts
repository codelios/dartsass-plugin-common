// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { ILog } from './log';
import { writeToFile } from './writer';
import fs from "fs"; // Without star
var CleanCSS = require('clean-css');


const Options = {

};

export class CleanCSSMinifier {



    constructor() {
    }

    public minify(src: string, encoding: string, target: string, _log: ILog): Promise<boolean> {
        return new Promise( function(resolve, reject){
            _log.debug(`About to minify ${src} to ${target}`);
            fs.readFile(src, encoding, function(err: (NodeJS.ErrnoException | null), contents) {
                if (err !== null) {
                    _log.appendLine(`Error: Minify error while reading file ${src} - ${err}`);
                    reject(err);
                    return;
                }
                const data = new CleanCSS(Options).minify(contents);
                writeToFile(target, data.styles, _log).then(
                    value => {
                        resolve(true);
                    },
                    err => {
                        _log.appendLine(`Error: Error writing minified css to ${target} - ${err}`);
                        reject(err);
                    }
                );
            });
        });
    }


}