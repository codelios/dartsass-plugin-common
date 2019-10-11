// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import { CompilerConfig } from './config';
import { ILog } from './log';
import { IDocument } from './document';
import { validateDocument } from './validate';
import {ISassCompiler} from './compiler';
import { DartSassCompiler } from './dartsasscompiler';

let sassCompiler: ISassCompiler = new DartSassCompiler();


export function CompileCurrentFile(
    document: IDocument,
    extensionConfig: CompilerConfig,
    _log: ILog, compileSingleFile: boolean) {
    if (!validateDocument(document, extensionConfig, _log)) {
        return;
    }
    if (extensionConfig.debug) {
        _log.appendLine(`About to compile ${document.getFileName()}`);
    }
    sassCompiler.compileDocument(document, extensionConfig, compileSingleFile, _log);
}

export function CompileAll(projectRoot: string, _log: ILog): boolean {
    return sassCompiler.compileAll(projectRoot, _log);
}