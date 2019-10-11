// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';
import * as path from 'path';
import { CompilerConfig } from './config';
import { xformPath } from './util';


export function getOutputCSS(projectRoot: string, input: string, fileonly: string, config : CompilerConfig): string {
    let targetDirectory = path.dirname(input);
    if (config.targetDirectory.length > 0) {
        targetDirectory = xformPath(projectRoot, config.targetDirectory);
    }
    return path.join(targetDirectory, fileonly + '.css');
}

export function getOutputMinifiedCSS(projectRoot: string, input: string, fileonly: string, config: CompilerConfig): string {
    let targetMinifiedDirectory = path.dirname(input);
    if (config.targetDirectory.length > 0) {
        targetMinifiedDirectory = xformPath(projectRoot, config.targetMinifiedDirectory);
    }
    return path.join(targetMinifiedDirectory, fileonly + '.min.css');
}
