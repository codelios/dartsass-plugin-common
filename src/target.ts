// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';
import * as path from 'path';
import { CompilerConfig } from './config';


export function getOutputCSS(input: string, fileonly: string, config : CompilerConfig): string {
    const filedir = path.dirname(input);
    return path.join(filedir, fileonly + '.css');
}

export function getOutputMinifiedCSS(input: string, fileonly: string, config : CompilerConfig): string {
    const filedir = path.dirname(input);
    return path.join(filedir, fileonly + '.min.css');
}