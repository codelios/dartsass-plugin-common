// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { ILog } from './log';
import { writeToFile } from './writer';
import fs from "fs"; // Without star
var CleanCSS = require('clean-css');


export class CleanCSSMinifier {


    constructor() {
    }

    public minify(src: string, encoding: string, target: string, _log: ILog): Promise<boolean> {
        return new Promise( function(resolve, reject){
            _log.appendLine(`About to minify ${src} to ${target}`);
            var options = { /* options */ };
            fs.readFile(src, encoding, function(err: (NodeJS.ErrnoException | null), contents) {
                if (err !== null) {
                    reject(`Error while minifying file ${src}`);
                }
                const data = new CleanCSS(options).minify(contents);
                writeToFile(target, data, _log).then(
                    value => {
                        resolve(true);
                    },
                    err => {
                        _log.appendLine(`Warning: Error writing minified css to ${target} - ${err}`);
                    }
                );
            });
        });
    }


}