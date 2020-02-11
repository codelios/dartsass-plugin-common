// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import * as fs from 'fs';

import { CompilerConfig } from './config';
import { ILog } from './log';
import { Prefixer } from './autoprefix';
import postcss = require('postcss');

export function writeToFile(outPath: string, data: any, _log: ILog) : Promise<string> {
    return new Promise( function(resolve, reject){
        fs.writeFile(outPath, data, (err: NodeJS.ErrnoException | null) => {
            if (err !== null) {
                _log.appendLine(`Warning: ${err} while writing ${outPath}`);
                reject(`Error while writing to file ${outPath}`);
                return;
            }
            resolve(`${outPath}`);
        });
    });
}

export function autoPrefixCSS(output: string, data: any,
    config : CompilerConfig,
    _log: ILog): Promise<string> {
    if (config.disableAutoPrefixer) {
        return writeToFile(output, data, _log);
    }
    const prefixer = Prefixer.NewPrefixer(config.autoPrefixBrowsersList);
    return new Promise<string>(function(resolve, reject) {
        prefixer.process(data).then(
            (prefixedResult: postcss.Result) => {
                writeToFile(output, prefixedResult.css,  _log).then(
                    value => resolve(value),
                    err => reject(err)
                )
            }
        )
    });
}


export function autoPrefixCSSFile(output: string, inFile: string,
    config : CompilerConfig,
    _log: ILog): Promise<string> {
    return new Promise<string>(function(resolve, reject) {
        if (config.disableAutoPrefixer) {
            resolve(inFile);
        }
        fs.readFile(inFile, 'utf8', function(err, contents) {
            if (err) {
                reject(err);
                return;
            }
            autoPrefixCSS(output, contents, config, _log).then(
                value => resolve(value),
                err => reject(err)
            );
        });
    });

}
