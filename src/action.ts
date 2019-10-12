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
import { NativeCompiler } from './native';

let sassCompiler: ISassCompiler = new DartSassCompiler();
let nativeCompiler: ISassCompiler = new NativeCompiler();

export function getCurrentCompiler(extensionConfig: CompilerConfig, _log: ILog) : ISassCompiler {
    if (extensionConfig.sassBinPath.length > 0) {
        return nativeCompiler;
    } else {
        return sassCompiler;
    }
}

export function CompileCurrentFile(
    document: IDocument,
    extensionConfig: CompilerConfig,
    _log: ILog) {
    if (!validateDocument(document, extensionConfig, _log)) {
        return;
    }
    if (extensionConfig.debug) {
        _log.appendLine(`About to compile ${document.getFileName()}`);
    }
    getCurrentCompiler(extensionConfig, _log).compileDocument(document, extensionConfig, _log);
}

export function CompileAll(extensionConfig: CompilerConfig, projectRoot: string, _log: ILog): boolean {
    return getCurrentCompiler(extensionConfig, _log).compileAll(extensionConfig, projectRoot, _log);
}

export function SayVersion(extensionConfig: CompilerConfig, _log: ILog): Promise<string> {
    return getCurrentCompiler(extensionConfig, _log).sayVersion(extensionConfig, _log);
}

export function Which(extensionConfig: CompilerConfig, _log: ILog): string {
    return getCurrentCompiler(extensionConfig, _log).which(extensionConfig, _log);
}