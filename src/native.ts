// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';

import { CompilerConfig } from './config';
import { IDocument } from './document';
import { ILog } from './log';

export class NativeCompiler {


    constructor() {
    }

    public compileAll(config: CompilerConfig, projectRoot: string, _log: ILog) : boolean {
        _log.error('Not yet implemented. To Compile All the sass files inside the given workspace');
        return false;
    }

    public which(config: CompilerConfig, _log: ILog) : string {
        return `Source: ${this.sayVersion(config, _log)}`;
    }


    public sayVersion(config: CompilerConfig, _log: ILog) : string {
        return `Not yet implemented`;
    }

    public compileDocument(document: IDocument, dartsassConfig: CompilerConfig,
        compileSingleFile: boolean, _log: ILog) {
            _log.error('Not yet implemented');
    }

}