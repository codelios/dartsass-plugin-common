// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';

import { CompilerConfig } from './config';
import { IDocument } from './document';
import { ILog } from './log';
import { Run } from './run';

/**
 * NativeCompiler uses the sass executable present in config.sassBinPath and uses the cmd line to compile the same.
 */
export class NativeCompiler {


    constructor() {
    }

    public compileAll(config: CompilerConfig, projectRoot: string, _log: ILog) : boolean {
        _log.error('Not yet implemented. To Compile All the sass files inside the given workspace');
        return false;
    }

    public which(config: CompilerConfig, _log: ILog) : Promise<string> {
        return new Promise(function(resolve, _) {
            resolve(config.sassBinPath);
        });
    }


    public sayVersion(config: CompilerConfig, _log: ILog): Promise<string> {
        try {
            return Run(config.sassBinPath, ['--version'], _log);
        } catch(error) {
            return new Promise(function(_, reject) {
                reject(error.toString());
            });
        }
    }

    public compileDocument(document: IDocument, dartsassConfig: CompilerConfig,
        _log: ILog): Promise<string> {
            return new Promise<string>(
                function(resolve, reject) {
                    // TODO: Compile using the command line
                    _log.error('Not yet implemented');
                    reject('Not Yet Implemented');
                }
            );
    }

}