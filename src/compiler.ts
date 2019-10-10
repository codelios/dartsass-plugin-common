// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import * as path from 'path';

import { CompilerConfig } from './config';
import { ILog } from './log';
let lastCompiledTime = Date.now() - 100 * 1000;

export interface ISassCompiler {

    sayVersion(_log: ILog) : string;

    compileAll(projectRoot: vscode.Uri, _log: ILog) : boolean;

    compileDocument(document: vscode.TextDocument, config: CompilerConfig,
        compileSingleFile: boolean, _log: ILog) : void;

}



function isTooSoon(pauseInterval: number) {
    const now = Date.now();
    return (now - lastCompiledTime) < (pauseInterval * 1000);
}

export function compileCurrentFile(compiler: ISassCompiler,
    document: vscode.TextDocument,
    extensionConfig: CompilerConfig,
    _log: ILog, compileSingleFile: boolean) {
    if (document.languageId !== 'scss' && document.languageId !== 'sass') {
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
        _log.appendLine(`About to compile ${document.fileName}`);
    }
    compiler.compileDocument(document, extensionConfig, compileSingleFile, _log);
    lastCompiledTime = Date.now();
}


export function getFileName(document: vscode.TextDocument) {
    if (document.languageId === 'scss') {
        return  path.basename(document.fileName, '.scss');
    } else if (document.languageId === 'sass') {
        return  path.basename(document.fileName, '.sass');
    } else {
        return "";
    }
}

export function doesStartWithUnderscore(document: vscode.TextDocument) {
    const fileOnly = getFileName(document);
    if (fileOnly.length === 0) {
        return true;
    }
    return fileOnly.startsWith("_");
}