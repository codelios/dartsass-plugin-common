// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import { ILog } from './log';
import { writeToFile, deleteFile } from './fileutil';

export interface CSSFile {

    css: Buffer;

    sourceMap: any;
}



function writeSourceMap(value: any, sourceMapFile: string, _log: ILog): Promise<number> {
    if (value === undefined || value === null) {
        _log.debug(`Warning: sourcemap is null. Hence ${sourceMapFile} not being written but deleted`);
        deleteFile(sourceMapFile, _log);
        return new Promise<number>(function(resolve, reject) {
            resolve(0);
        });
    } else {
        return writeToFile(sourceMapFile, value, _log);
    }
}

export function writeCSSFile(src: CSSFile, output: string, _log: ILog): Promise<number> {
    return new Promise<number>(function(resolve, reject) {
        writeToFile(output, src.css, _log).then(
            value => {
                const sourceMapFile = output + ".map";
                writeSourceMap(src.sourceMap, sourceMapFile, _log).then(
                    value => resolve(value),
                    err => reject(err)
                );
            },
            err => {
                reject(err);
            }
        );
    });
}
