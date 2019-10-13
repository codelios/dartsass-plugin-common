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
import { validateTargetDirectories} from './target';

const sassCompiler: ISassCompiler = new DartSassCompiler();
const nativeCompiler: ISassCompiler = new NativeCompiler();
const emptyPromise: Promise<string> = new Promise<string>(function(resolve, reject) {
    resolve('');
});

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
    _log: ILog): Promise<string> {
    if (!validateDocument(document, extensionConfig, _log)) {
        return emptyPromise;
    }
    const err = validateTargetDirectories(document, extensionConfig);
    if (err) {
        return new Promise(function(resolve, reject) {
            reject(`${err}`);
        });
    }
    if (extensionConfig.debug) {
        _log.appendLine(`About to compile ${document.getFileName()}`);
    }
    return getCurrentCompiler(extensionConfig, _log).compileDocument(document, extensionConfig, _log);
}

export function CompileAll(extensionConfig: CompilerConfig, projectRoot: string, _log: ILog): Promise<string> {
    return getCurrentCompiler(extensionConfig, _log).compileAll(extensionConfig, projectRoot, _log);
}

export function SayVersion(extensionConfig: CompilerConfig, _log: ILog): Promise<string> {
    return getCurrentCompiler(extensionConfig, _log).sayVersion(extensionConfig, _log);
}

export function Which(extensionConfig: CompilerConfig, _log: ILog): Promise<string> {
    return getCurrentCompiler(extensionConfig, _log).which(extensionConfig, _log);
}

export function Validate(extensionConfig: CompilerConfig, _log: ILog): Promise<string> {
    return getCurrentCompiler(extensionConfig, _log).validate(extensionConfig);
}

export function Watch(extensionConfig: CompilerConfig, _log: ILog) : Promise<string> {
    return getCurrentCompiler(extensionConfig, _log).watch(extensionConfig, _log);
}