// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import fs from "fs";
import { ILog } from './log';

export function writeToFile(outPath: string, data: Buffer, _log: ILog) : Promise<number> {
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

export function deleteFile(docPath: string, _log: ILog) {
    try {
        fs.unlink(docPath, function(err) {
            if (err) {
                _log.appendLine(`Warning: Error deleting ${docPath} - ${err}`);
            }
            _log.debug(`Deleted ${docPath} successfully`);
        });
    } catch(err) {
        _log.appendLine(`Warning: Error deleting ${docPath} - ${err}`)
    }
}

export function readFileSync(docPath: string): Buffer {
    if (fs.existsSync(docPath)) {
        return fs.readFileSync(docPath);
    } else {
        return Buffer.from('');
    }
}