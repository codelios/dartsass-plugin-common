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

    public compileDocument(document: IDocument, config: CompilerConfig,
        _log: ILog): Promise<string> {
            const self = this;
            try {
                const output = getOutputCSS( document, config, _log);
                const sassBinPath  = this.getSassBinPath(document.getProjectRoot(), config.sassBinPath)
                return new Promise(function(resolve, reject) {
                    Run(sassBinPath, self.getArgs(document, config, output, false), _log).then(
                        value => {
                            autoPrefixCSSFile(output, output, config,  _log).then(
                                value => {
                                    if (config.disableMinifiedFileGeneration) {
                                        resolve(value);
                                    }
                                },
                                err => reject(err)
                            )
                            if (!config.disableMinifiedFileGeneration) {
                                const minifiedOutput = getOutputMinifiedCSS(document, config, _log);
                                Run(sassBinPath, self.getArgs(document, config, minifiedOutput, true), _log).then(
                                    value => {
                                        autoPrefixCSSFile(minifiedOutput, minifiedOutput, config,  _log).then(
                                            value => {
                                                resolve(value)
                                            },
                                            err => reject(err)
                                        )
                                    },
                                    err => reject(err)
                                )
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

    public watch(srcdir: string, projectRoot: string, config: CompilerConfig, _log: ILog) : Promise<ProcessOutput> {
        const compressed = !config.disableMinifiedFileGeneration;
        const args = this.doGetArgs(projectRoot, config, compressed);
        args.push('--watch');
        let targetDirectory = getWatchTargetDirectory(srcdir, projectRoot, config);
        if (compressed) {
            targetDirectory = getWatchMinifiedTargetDirectory(srcdir, projectRoot, config);
        }
        args.push(util.format("%s:%s", srcdir, targetDirectory));
        _log.appendLine(`Watching ${srcdir}`);
        const sassBinPath = this.getSassBinPath(projectRoot, config.sassBinPath);
        return RunDetached(sassBinPath, args, _log);
    }

    getArgs(document: IDocument, config: CompilerConfig, output: string, minified: boolean): string[] {
        const result = this.doGetArgs(document.getProjectRoot(), config, minified);
        const input = document.getFileName();
        result.push(util.format("%s:%s", input, output));
        return result;
    }

}