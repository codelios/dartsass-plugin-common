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

export function writeSassOutput(output: string, data: any, _log: ILog) : Promise<string> {
    return new Promise( function(resolve, reject){
        fs.writeFile(output, data, (err: NodeJS.ErrnoException | null) => {
            if (err !== null) {
                _log.appendLine(`${err} while writing ${output}`);
                reject(`Error while writing the generated css file ${output}`);
                return;
            }
            resolve(`${output}`);
        });
    });
}

export function autoPrefixCSS(output: string, data: any,
    config : CompilerConfig,
    _log: ILog): Promise<string> {
    if (config.debug) {
        _log.appendLine("disableAutoPrefixer: " + config.disableAutoPrefixer);
    }
    if (!config.disableAutoPrefixer) {
        const prefixer = Prefixer.NewPrefixer(config.autoPrefixBrowsersList);
        return new Promise<string>(function(resolve, reject) {
            prefixer.process(data).then(
                (prefixedResult: postcss.Result) => {
                    writeSassOutput(output, prefixedResult.css,  _log).then(
                        value => resolve(value),
                        err => reject(err)
                    )
                }
            )
        });
    } else {
        return writeSassOutput(output, data, _log);
    }
}
