// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { CompilerConfig } from './config';
import { ILog } from './log';
import { IDocument } from './document';
import { validateDocument } from './validate';

export interface ISassCompiler {

    sayVersion(_log: ILog) : string;

    compileAll(projectRoot: string, _log: ILog) : boolean;

    compileDocument(document: IDocument, config: CompilerConfig,
        compileSingleFile: boolean, _log: ILog) : void;

}

export function CompileCurrentFile(compiler: ISassCompiler,
    document: IDocument,
    extensionConfig: CompilerConfig,
    _log: ILog, compileSingleFile: boolean) {
    if (!validateDocument(document, extensionConfig, _log)) {
        return;
    }
    if (extensionConfig.debug) {
        _log.appendLine(`About to compile ${document.getFileName()}`);
    }
    compiler.compileDocument(document, extensionConfig, compileSingleFile, _log);
}
