// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import { xformPathsFromRoot, xformPathFromRoot } from './uri';


export function xformPath(projectRoot: string, entry: string): string {
    if (!projectRoot) {
        return entry;
    }
    return xformPathFromRoot(projectRoot, entry);
}

export function xformPaths(projectRoot: string, includePath: Array<string>): Array<string> {
    if (!projectRoot) {
        return includePath;
    }
    return xformPathsFromRoot(projectRoot, includePath);
}