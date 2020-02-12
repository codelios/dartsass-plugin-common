// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import fs from "fs"; // Without star
import { ILog } from './log';


export function writeToFile(outPath: string, data: any, _log: ILog) : Promise<number> {
    return new Promise<number>( function(resolve, reject){
        fs.writeFile(outPath, data, (err: NodeJS.ErrnoException | null) => {
            if (err !== null) {
                _log.appendLine(`Warning: ${err} while writing ${outPath}`);
                reject(`Error while writing to file ${outPath}`);
                return;
            }
            if (data === undefined || data === null) {
                resolve(0);
            } else {
                resolve(data.length);
            }
        });
    });
}


export function doTransformSync(src: string, target: string, _log: ILog, fnTransform: (value: Buffer) => Promise<Buffer>): Promise<number> {
    _log.debug(`About to transform ${src} to ${target}`);
    const contents = fs.readFileSync(src);
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