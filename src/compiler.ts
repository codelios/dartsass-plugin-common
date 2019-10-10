// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { CompilerConfig } from './config';
import { ILog } from './log';
import { IDocument } from './document';
let lastCompiledTime = Date.now() - 100 * 1000;

export interface ISassCompiler {

    sayVersion(_log: ILog) : string;

    compileAll(projectRoot: string, _log: ILog) : boolean;

    compileDocument(document: IDocument, config: CompilerConfig,
        compileSingleFile: boolean, _log: ILog) : void;

}



function isTooSoon(pauseInterval: number) {
    const now = Date.now();
    return (now - lastCompiledTime) < (pauseInterval * 1000);
}

export function compileCurrentFile(compiler: ISassCompiler,
    document: IDocument,
    extensionConfig: CompilerConfig,
    _log: ILog, compileSingleFile: boolean) {
    if (!document.isSass()) {
        return;
    }
    if (!extensionConfig.enableStartWithUnderscores && doesStartWithUnderscore(document)) {
        // Ignore the files that start with underscore
        return;
    }
    if (isTooSoon(extensionConfig.pauseInterval)) {
        if (extensionConfig.debug) {
            _log.appendLine(`Last Compiled Time: ${lastCompiledTime}. Too soon and ignoring hence`);
        }
        return;
    }
    if (extensionConfig.debug) {
        _log.appendLine(`About to compile ${document.getFileName()}`);
    }
    compiler.compileDocument(document, extensionConfig, compileSingleFile, _log);
    lastCompiledTime = Date.now();
}


export function doesStartWithUnderscore(document: IDocument) {
    const fileOnly = document.getFileName();
    if (fileOnly.length === 0) {
        return true;
    }
    return fileOnly.startsWith("_");
}