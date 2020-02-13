// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import { ILog } from './log';
import { writeToFile, deleteFile } from './fileutil';

export interface CSSFile {

    output: Buffer;

    sourceMap: any;
}



export function doTransformBytes(src: CSSFile, fnTransform: (value: CSSFile) => Promise<CSSFile>): Promise<CSSFile> {
    return new Promise<CSSFile>( function(resolve, reject){
        fnTransform(src).then(
            (data: CSSFile) => {
                resolve(data);
            },
            err => {
                reject(err);
            }
        )
    });
}

function writeSourceMap(value: any, sourceMapFile: string, _log: ILog): Promise<number> {
    if (value === undefined || value === null) {
        _log.debug(`Warning: ${sourceMapFile} not being written. sourcemap is null`);
        deleteFile(sourceMapFile, _log);
    }
    return writeToFile(sourceMapFile, value, _log);
}

export function writeCSSFile(src: CSSFile, output: string, _log: ILog): Promise<number> {
    return new Promise<number>(function(resolve, reject) {
        writeToFile(output, src.output, _log).then(
            value => {
                const sourceMapFile = output + ".map";
                writeSourceMap(src.sourceMap, sourceMapFile, _log).then(
                    value => resolve(value),
                    err => reject(err)
                )
            },
            err => {
                reject(err);
            }
        );
    });
}