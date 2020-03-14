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
import { getWatchTargetDirectory, getOutputCSS, getOutputMinifiedCSS, getRelativeDirectory} from './target';
import { autoPrefixCSSBytes } from './autoprefix';
import { readFileSync } from './fileutil';
import { isBeingWatched } from './compiler';
import { ProcessOutput, isWindows } from './run';
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

    verifySassBinPath(sassBinPath: string, _log: ILog): boolean {
        return true;
    }

    public sayVersion(config: CompilerConfig, projectRoot: string, _log: ILog): Promise<string> {
        const sassBinPath = this.getSassBinPath(projectRoot, config.sassBinPath)
        const args = VersionArgs;
        let runPromise = Run(sassBinPath, args, projectRoot, _log);
        if (isWindows()) {
            const relativeCmd = getRelativeDirectory(projectRoot, sassBinPath);
            this.verifySassBinPath(relativeCmd, _log);
            args.unshift(relativeCmd);
            runPromise = Run(config.nodeExePath, args, projectRoot, _log);
        }
        return runPromise;
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
        const self = this;
        return new Promise(function(resolve, reject) {
            let runPromise = Run(sassBinPath, args, cwd, _log);
            if (isWindows()) {
                const relativeCmd = getRelativeDirectory(cwd, sassBinPath);
                self.verifySassBinPath(relativeCmd, _log);
                args.unshift(relativeCmd);
                runPromise = Run(config.nodeExePath, args, cwd, _log);
            }
            runPromise.then(
                originalValue => {
                    const data = readFileSync(output);
                    autoPrefixCSSBytes(output, {
                        css: data,
                        sourceMap: readFileSync(output+".map"),
                    }, config, _log).then(
                        autoPrefixvalue => resolve(output),
                        err => reject(err)
                    )
               },
               err => reject(err)
            );
        });
    }

    getArgs(document: IDocument, config: CompilerConfig, output: string, minified: boolean): string[] {
        const result = this.doGetArgs(document.getProjectRoot(), config, minified);
        const input = document.getFileName();
        const base = document.getProjectRoot();
        result.push(util.format("%s:%s", getRelativeDirectory(base, input), getRelativeDirectory(base,output)));
        return result;
    }

    public compileDocument(document: IDocument, config: CompilerConfig,
        _log: ILog): Promise<string> {
        const self = this;
        try {
            const sassBinPath  = this.getSassBinPath(document.getProjectRoot(), config.sassBinPath)
            return new Promise(function(resolve, reject) {
                if (isBeingWatched(document, config, _log)) {
                    resolve(`Document already being watched`);
                    return;
                }
                const output = getOutputCSS(document, config, _log);
                const args = self.getArgs(document, config, output, false);
                self.doCompileDocument(sassBinPath, output, config, document.getProjectRoot(), _log, args).then(
                    value =>  {
                        if (!config.disableMinifiedFileGeneration) {
                            const minifiedOutput = getOutputMinifiedCSS(document, config, _log);
                            const args = self.getArgs(document, config, minifiedOutput, true);
                            self.doCompileDocument(sassBinPath, minifiedOutput, config, document.getProjectRoot(), _log, args).then(
                                value => resolve(value),
                                err => reject(err)
                            );
                        } else {
                            resolve(value);
                        }
                    },
                    err => reject(err)
                );
            });
        } catch(err) {
            return new Promise(function(_, reject) {
                reject(err);
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
        const args = this.doGetArgs(projectRoot, config, false);
        args.push('--watch');
        const relativeSrcDir = getRelativeDirectory(projectRoot, _srcdir);
        let targetDirectory = getWatchTargetDirectory(relativeSrcDir, config);
        args.push(util.format("%s:%s", relativeSrcDir, targetDirectory));
        return args
    }

    public watch(srcdir: string, projectRoot: string, config: CompilerConfig, _log: ILog) : Promise<ProcessOutput> {
        const args = this.doGetWatchArgs(projectRoot, config, srcdir);
        const sassBinPath = this.getSassBinPath(projectRoot, config.sassBinPath);
        _log.debug(`Watching ${srcdir} by ${sassBinPath}.`);
        if (isWindows()) {
            const relativeCmd = getRelativeDirectory(projectRoot, sassBinPath);
            this.verifySassBinPath(relativeCmd, _log);
            args.unshift(relativeCmd);
            return RunDetached(config.nodeExePath, projectRoot, args, _log);
        } else {
            return RunDetached(sassBinPath, projectRoot, args, _log);
        }
    }

}