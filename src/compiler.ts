// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { CompilerConfig } from './config';
import { ILog } from './log';
import { IDocument } from './document';

export interface ISassCompiler {

    sayVersion(_log: ILog) : string;

    compileAll(projectRoot: string, _log: ILog) : boolean;

    compileDocument(document: IDocument, config: CompilerConfig,
        compileSingleFile: boolean, _log: ILog) : void;

}
