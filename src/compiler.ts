// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { CompilerConfig } from './config';
import { ILog } from './log';
import { IDocument } from './document';
import { ProcessOutput } from './run';
import { getRelativeDirectory } from './target';

export interface ISassCompiler {

    sayVersion(config: CompilerConfig, projectRoot: string, _log: ILog): Promise<string>;

    validate(config: CompilerConfig, projectRoot: string): Promise<string>;

    compileDocument(document: IDocument, config: CompilerConfig, _log: ILog) : Promise<string>;

    watch(srcdir: string, projectRoot: string, config: CompilerConfig, minified: boolean, _log: ILog): Promise<ProcessOutput>;
}


export function isBeingWatched(projectRoot: string, watchDirectories: Array<string>, docPath: string) : boolean {
    let watched = false;
    for (const watchDirectory of watchDirectories) {
        const relativeDocPath = getRelativeDirectory(watchDirectory, docPath);
        if (relativeDocPath !== docPath) {
            // Indeed it is a subdirectory of watchDirectory so being watched
            watched = true;
            break;
        }
    }
    return watched;
}