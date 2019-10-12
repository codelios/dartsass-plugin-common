// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { CompilerConfig } from './config';
import { ILog } from './log';
import { IDocument } from './document';

export interface ISassCompiler {

    which(config: CompilerConfig, _log: ILog) : string;

    sayVersion(config: CompilerConfig, _log: ILog): Promise<string>;

    compileAll(config: CompilerConfig, projectRoot: string, _log: ILog) : boolean;

    compileDocument(document: IDocument, config: CompilerConfig, _log: ILog) : void;

}
