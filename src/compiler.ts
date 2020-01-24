// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { CompilerConfig } from './config';
import { ILog } from './log';
import { IDocument } from './document';
import { ProcessOutput } from './run';

export const CodeNotImplemented = 500;

export interface ISassCompiler {

    sayVersion(config: CompilerConfig, projectRoot: string, _log: ILog): Promise<string>;

    validate(config: CompilerConfig, projectRoot: string): Promise<string>;

    compileDocument(document: IDocument, config: CompilerConfig, _log: ILog) : Promise<string>;

    watch(srcdir: string, projectRoot: string, config: CompilerConfig, minified: boolean, _log: ILog): Promise<ProcessOutput>;
}
