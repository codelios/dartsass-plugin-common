// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import * as fs from 'fs';

import { ILog } from './log';

export function writeToFile(outPath: string, data: any, _log: ILog) : Promise<number> {
    return new Promise( function(resolve, reject){
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

