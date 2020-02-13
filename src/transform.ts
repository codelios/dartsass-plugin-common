// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { ILog } from './log';
import { readFileSync, writeToFile } from './fileutil';


export function doTransformSync(src: string, target: string, _log: ILog, fnTransform: (value: Buffer) => Promise<Buffer>): Promise<number> {
    const contents = readFileSync(src);
    return doTransformBytes(contents, target, _log, fnTransform);
}

export function doTransformBytes(src: Buffer, target: string, _log: ILog, fnTransform: (value: Buffer) => Promise<Buffer>): Promise<number> {
    return new Promise<number>( function(resolve, reject){
        fnTransform(src).then(
            data => {
                writeToFile(target, data, _log).then(
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