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
import { getWatchTargetDirectory, getOutputCSS, getRelativeDirectory} from './target';
import { autoPrefixCSSFile } from './writer';
import { isBeingWatched } from './compiler';
import { ProcessOutput } from './run';
import util from 'util';
import fs from "fs";

const VersionArgs = ['--version'];

/**
 * NativeCompiler uses the sass executable present in config.sassBinPath and uses the cmd line to compile the same.
 */
export class NativeCompiler {


    constructor() {
    }

    getSassBinPath(projectRoot: string, sassBinPath: string): string {
        return xformPath(projectRoot, sassBinPath);
    }

    public sayVersion(config: CompilerConfig, projectRoot: string, _log: ILog): Promise<string> {
        const sassBinPath = this.getSassBinPath(projectRoot, config.sassBinPath)
        try {
            return Run(sassBinPath, VersionArgs, projectRoot, _log, config.debug);
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
        config: CompilerConfig, cwd: string, _log: ILog, args: string[]): Promise<string> {
        return new Promise(function(resolve, reject) {
            Run(sassBinPath, args, cwd, _log, config.debug).then(
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

    getArgs(document: IDocument, config: CompilerConfig, output: string): string[] {
        const result = this.doGetArgs(document.getProjectRoot(), config);
        const input = document.getFileName();
        const base = document.getProjectRoot();
        result.push(util.format("%s:%s", getRelativeDirectory(base, input), getRelativeDirectory(base,output)));
        return result;
    }

    _internalCompileDocument(document: IDocument, config: CompilerConfig, _log: ILog): Promise<string> {
        const self = this;
        try {
            const sassBinPath  = this.getSassBinPath(document.getProjectRoot(), config.sassBinPath)
            return new Promise(function(resolve, reject) {
                const output = getOutputCSS(document, config, _log);
                const args = self.getArgs(document, config, output);
                self.doCompileDocument(sassBinPath, output, config, document.getProjectRoot(), _log, args).then(
                    value => {
                        resolve(value);
                    },
                    err => {
                        reject(err);
                    }
                )
            });
        } catch(err) {
            return new Promise(function(_, reject) {
                reject(err);
            });
        }
    }
    public compileDocument(document: IDocument, config: CompilerConfig,
        _log: ILog): Promise<string> {
        if (!isBeingWatched(document, config, _log)) {
            return this._internalCompileDocument(document, config, _log);
        } else {
            return new Promise(function(resolve, _) {
                resolve(`Document already being watched`);
            });
        }
    }

    doGetArgs(projectRoot: string, config: CompilerConfig) : Array<string> {
        const includePaths = xformPaths(projectRoot, config.includePath);
        const result = new Array<string>();
        if (config.disableSourceMap) {
            result.push("--no-source-map");
        }
        for (const path of includePaths) {
            result.push("-I");
            const relativePath = getRelativeDirectory(projectRoot, path);
            let includePath = relativePath;
            if (relativePath.indexOf(' ') !== -1) {
                // has spaces in it so encode it better
                includePath = util.format("\"%s\"", relativePath);
            }
            result.push(includePath);
        }
        return result;
    }

    doGetWatchArgs(projectRoot: string, config: CompilerConfig, _srcdir: string): Array<string> {
        const args = this.doGetArgs(projectRoot, config);
        args.push('--watch');
        const relativeSrcDir = getRelativeDirectory(projectRoot, _srcdir);
        let targetDirectory = getWatchTargetDirectory(relativeSrcDir, config);
        args.push(util.format("%s:%s", relativeSrcDir, targetDirectory));
        return args
    }

    public watch(srcdir: string, projectRoot: string, config: CompilerConfig, _log: ILog) : Promise<ProcessOutput> {
        const args = this.doGetWatchArgs(projectRoot, config, srcdir);
        const sassBinPath = this.getSassBinPath(projectRoot, config.sassBinPath);
        _log.appendLine(`Watching ${srcdir} by ${sassBinPath}.`);
        return RunDetached(sassBinPath, projectRoot, args, _log);
    }

}