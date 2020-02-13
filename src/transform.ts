// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { ILog } from './log';
import { writeToFile } from './fileutil';
import { CSSFile } from './cssfile';



export function doTransformBytes(src: CSSFile, target: string, _log: ILog, fnTransform: (value: CSSFile) => Promise<CSSFile>): Promise<number> {
    return new Promise<number>( function(resolve, reject){
        fnTransform(src).then(
            (data: CSSFile) => {
                writeToFile(target, data.output, _log).then(
                    value => {
                        resolve(value);
                    },
                    err => {
                        _log.appendLine(`Error: Error writing minified css to ${target} - ${err}`);
                        reject(err);
                    }
                );
            },
            err => {
                reject(err);
            }
        )
    });
}