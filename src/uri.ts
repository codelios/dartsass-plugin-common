// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import * as path from 'path';


export function xformPathFromRoot(projectRoot: string, entry: string): string {
    if (path.isAbsolute(entry)) {
        return entry;
    }
    return path.join(projectRoot, entry);
}

export function xformPathsFromRoot(projectRoot: string, includePath: Array<string>): Array<string> {
    const output:Array<string> = new Array<string>();
    includePath.forEach(function(entry: string) {
        output.push(xformPathFromRoot(projectRoot, entry));
    });
    return output;
}
