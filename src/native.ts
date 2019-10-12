// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';

import { CompilerConfig } from './config';
import { IDocument } from './document';
import { ILog } from './log';
import { Run } from './run';
import { xformPaths} from './util';
import { getOutputCSS, getOutputMinifiedCSS} from './target';
import util from 'util';

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

    public compileDocument(document: IDocument, config: CompilerConfig,
        _log: ILog): Promise<string> {
            const self = this;
            try {
                return new Promise(function(resolve, reject) {
                    Run(config.sassBinPath, self.getArgs(document, config, _log, false), _log).then(
                        value => {
                            if (!config.disableMinifiedFileGeneration) {
                                Run(config.sassBinPath, self.getArgs(document, config, _log, true), _log).then(
                                    value => resolve(value),
                                    err => reject(err)
                                )
                            } else {
                                resolve(value);
                            }
                        },
                        err => reject(err)
                    )
                });
            } catch(error) {
                return new Promise(function(_, reject) {
                    reject(error.toString());
                });
            }
    }

    getArgs(document: IDocument, config: CompilerConfig, _log: ILog, minified: boolean): string[] {
        const includePaths = xformPaths(document.getProjectRoot(), config.includePath);
        const input = document.getFileName();
        let output = getOutputCSS( document, config, _log);
        const result = new Array<string>();
        if (minified) {
            output = getOutputMinifiedCSS(document, config, _log);
            result.push("--style");
            result.push("compressed");
        }
        for (const path of includePaths) {
            result.push("-I");
            result.push(path);
        }
        result.push(util.format("%s:%s", input, output));
        return result;
    }

}