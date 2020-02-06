// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';

import { CompilerConfig } from './config';
import { IDocument } from './document';
import { ILog } from './log';
import { Run, RunDetached } from './run';
import { xformPath, xformPaths} from './util';
import { getWatchTargetDirectory, getWatchMinifiedTargetDirectory, getOutputCSS, getOutputMinifiedCSS} from './target';
import { autoPrefixCSSFile } from './writer';
import { ProcessOutput } from './run';
import util from 'util';
import fs from "fs";

/**
 * NativeCompiler uses the sass executable present in config.sassBinPath and uses the cmd line to compile the same.
 */
export class NativeCompiler {


    constructor() {
    }

    getSassBinPath(projectRoot: string, sassBinPath: string): string {
        return xformPath(projectRoot, sassBinPath)
    }

    public sayVersion(config: CompilerConfig, projectRoot: string, _log: ILog): Promise<string> {
        const sassBinPath = this.getSassBinPath(projectRoot, config.sassBinPath)
        try {
            return Run(sassBinPath, ['--version'], _log);
        } catch(error) {
            return new Promise(function(_, reject) {
                reject(error.toString());
            });
        }
    }

    public validate(config: CompilerConfig, projectRoot: string): Promise<string> {
        const sassBinPath = this.getSassBinPath(projectRoot, config.sassBinPath)
        return new Promise(function(resolve, reject) {
            if (!fs.existsSync(sassBinPath)) {
                reject(`ProjectRoot: ${projectRoot}. Sass Binary Path ${sassBinPath} does not exist`);
            }
            if (fs.lstatSync(sassBinPath).isDirectory()) {
                reject(`ProjectRoot: ${projectRoot}. Sass Binary Path ${sassBinPath} is a directory`);
            }
            resolve('');
        });
    }

    doCompileDocument(sassBinPath: string, output: string,
        config: CompilerConfig, _log: ILog, args: string[]): Promise<string> {
        return new Promise(function(resolve, reject) {
            Run(sassBinPath, args, _log).then(
                originalValue => {
                    autoPrefixCSSFile(output, output, config,  _log).then(
                        autoPrefixvalue => {
                            resolve(originalValue + autoPrefixvalue);
                        },
                        err => reject(err)
                    )
               },
               err => reject(err)
            );
        });
    }

    public compileDocument(document: IDocument, config: CompilerConfig,
        _log: ILog): Promise<string> {
            const self = this;
            try {
                const sassBinPath  = this.getSassBinPath(document.getProjectRoot(), config.sassBinPath)
                return new Promise(function(resolve, reject) {
                    const output = getOutputCSS(document, config, _log);
                    const args = self.getArgs(document, config, output, false);
                    self.doCompileDocument(sassBinPath, output, config, _log, args).then(
                        value => {
                            if (!config.disableMinifiedFileGeneration) {
                                const minifiedOutput = getOutputMinifiedCSS(document, config, _log);
                                const minifiedArgs = self.getArgs(document, config, minifiedOutput, true);
                                self.doCompileDocument(sassBinPath, minifiedOutput, config, _log, minifiedArgs).then(
                                    minifiedValue => {
                                        resolve(minifiedValue);
                                    },
                                    err => {
                                        reject(err);
                                    }
                                );
                            } else {
                                resolve(value);
                            }
                        },
                        err => {
                            reject(err);
                        }
                    )
                });
            } catch(error) {
                return new Promise(function(_, reject) {
                    reject(error.toString());
                });
            }
    }

    doGetArgs(projectRoot: string, config: CompilerConfig, minified: boolean) : Array<string> {
        const includePaths = xformPaths(projectRoot, config.includePath);
        const result = new Array<string>();
        if (minified) {
            result.push("--style");
            result.push("compressed");
        }
        if (config.disableSourceMap) {
            result.push("--no-source-map");
        }
        for (const path of includePaths) {
            result.push("-I");
            result.push(path);
        }
        return result;
    }

    public watch(srcdir: string, projectRoot: string, config: CompilerConfig, minified: boolean, _log: ILog) : Promise<ProcessOutput> {
        const args = this.doGetArgs(projectRoot, config, minified);
        args.push('--watch');
        let targetDirectory = getWatchTargetDirectory(srcdir, projectRoot, config);
        if (minified) {
            targetDirectory = getWatchMinifiedTargetDirectory(srcdir, projectRoot, config);
        }
        args.push(util.format("\"%s\":\"%s\"", srcdir, targetDirectory));
        const sassBinPath = this.getSassBinPath(projectRoot, config.sassBinPath);
        _log.appendLine(`Watching ${srcdir}. Exec ${sassBinPath} ${args.join('  ')}`);
        return RunDetached(sassBinPath, args, _log);
    }

    getArgs(document: IDocument, config: CompilerConfig, output: string, minified: boolean): string[] {
        const result = this.doGetArgs(document.getProjectRoot(), config, minified);
        const input = document.getFileName();
        result.push(util.format("%s:%s", input, output));
        return result;
    }

}