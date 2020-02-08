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
import { xformPath } from './util';

export interface ISassCompiler {

    sayVersion(config: CompilerConfig, projectRoot: string, _log: ILog): Promise<string>;

    validate(config: CompilerConfig, projectRoot: string): Promise<string>;

    compileDocument(document: IDocument, config: CompilerConfig, _log: ILog) : Promise<string>;

    watch(srcdir: string, projectRoot: string, config: CompilerConfig, minified: boolean, _log: ILog): Promise<ProcessOutput>;
}


export function isBeingWatched(document: IDocument, config: CompilerConfig, _log: ILog) : boolean {
    const projectRoot = document.getProjectRoot();
    const docPath = document.getFileOnly();
    let watched = false;
    for (const watchDirectory of config.watchDirectories) {
        const fqWatchDirectory = xformPath(projectRoot, watchDirectory);
        const relativeDocPath = getRelativeDirectory(fqWatchDirectory, docPath);
        if (config.debug) {
            _log.appendLine(`relativeDocPath: ${relativeDocPath}, docPath: ${docPath} for fqWatchDirectory: ${fqWatchDirectory}`);
        }
        if (relativeDocPath !== docPath) {
            // Indeed it is a subdirectory of watchDirectory so being watched
            _log.appendLine(`Warning: Failed to compile ${docPath} as the directory ( ${watchDirectory} ) is already being watched `);
            watched = true;
            break;
        }
    }
    return watched;
}