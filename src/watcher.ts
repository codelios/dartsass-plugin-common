// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';

import { CompilerConfig } from './config';
import { ILog } from './log';
import { ProcessOutput, killProcess } from './run';
import { xformPath } from './util';
import { getCurrentCompiler } from './select';
import { ISassCompiler } from './compiler';
import { getWatchTargetDirectory, getWatchMinifiedTargetDirectory } from './target';

function doSingleLaunch(compiler: ISassCompiler, srcdir: string, projectRoot: string,
    config: CompilerConfig, minified: boolean, _log: ILog): Promise<ProcessOutput> {
    return compiler.watch(srcdir, projectRoot, config, minified, _log);
}

function doMinifiedLaunch(compiler: ISassCompiler, srcdir: string, projectRoot: string,
    config: CompilerConfig, _log: ILog): Promise<ProcessOutput> {
    const targetDirectory = getWatchTargetDirectory(srcdir, projectRoot, config);
    const targetMinifiedDirectory = getWatchMinifiedTargetDirectory(srcdir, projectRoot, config);
    if (targetDirectory !== targetMinifiedDirectory) {
        return doSingleLaunch(compiler, srcdir, projectRoot, config, true, _log);
    } else {
        _log.appendLine(`Failed to launch watcher for minified files since targetMinifiedDirectory \
            ${targetMinifiedDirectory} same as targetDirectory ${targetDirectory}. Check if property targetMinifiedDirectory is set and not same as targetDirectory property. `);
        return new Promise<ProcessOutput>(function(resolve, reject) {
            const processOutput: ProcessOutput = {
                code: 0,
                pid: 0,
                msg: 'Failed to launch watcher for minified files since targetMinifiedDirectory same as targetDirectory'
            }
            resolve(processOutput);
        });            
    }
}

export class Watcher {

    watchList: Map<string, Array<number>>  = new Map<string, Array<number>>();

    constructor() {
    }


    doLaunch(_srcdir: string, projectRoot: string, config: CompilerConfig, _log: ILog): Promise<string> {
        const srcdir =  xformPath(projectRoot, _srcdir);
        const compiler = getCurrentCompiler(config, _log);
        const self = this;
        return new Promise<string>(function(resolve, reject) {
            const pids = self.watchList.get(srcdir);
            if (pids !== null && pids !== undefined) {
                reject(`${srcdir} already being watched ( pids ${pids} )`);
                return;
            }
            doSingleLaunch(compiler, srcdir, projectRoot, config, false, _log).then(
                (value: ProcessOutput) => {
                    if (value.pid === undefined || value.pid === null || value.pid <= 0) {
                        self.watchList.delete(srcdir);
                        reject(`Unable to launch sass watcher for ${srcdir}. pid is undefined. Please check sassBinPath property.`);
                        return;
                    }
                    const pid1 = value.pid;
                    self.watchList.set(srcdir, [pid1]);
                    if (config.disableMinifiedFileGeneration) {
                        resolve(`Done`);
                        return;
                    }
                    doMinifiedLaunch(compiler, srcdir, projectRoot, config, _log).then(
                            (value2: ProcessOutput) => {
                                if (value2.pid !== undefined && value2.pid > 0) {
                                    self.watchList.set(srcdir, [pid1, value2.pid]);
                                    resolve(`Good`);
                                } else {
                                    resolve(value2.msg);
                                }
                            },
                            (err:ProcessOutput) => {
                                killProcess(pid1);
                                self.watchList.delete(srcdir);
                                reject(err.msg);
                            }
                    );
                },
                (err:ProcessOutput) => {
                    reject(err.msg);
                }
            );
        });
    }

    public ClearWatchDirectory(srcdir: string, _log: ILog) : boolean {
        const pids = this.watchList.get(srcdir);
        let cleared = false;
        if (pids !== null && pids !== undefined) {
            pids.forEach(function(value: number) {
                killProcess(value);
                cleared = true;
                _log.appendLine(`About to unwatch ${srcdir} with pid ${value}`);
            });
        }
        this.watchList.delete(srcdir);
        return cleared;
    }

    public ClearWatch(_srcdir: string, projectRoot: string, _log: ILog): boolean {
        const srcdir = xformPath(projectRoot, _srcdir);
        return this.ClearWatchDirectory(srcdir, _log);
    }

    public ClearAll(_log: ILog) {
        this.watchList.forEach((pids: Array<number>, key: string) => {
            pids.forEach(function(value: number) {
                _log.appendLine(`Unwatching ${key} with pid ${value}`);
                killProcess(value);
            });
        });
        this.watchList.clear();
    }

    /**
     * Relaunch relaunches all the watch processes for the watch directories
     */
    public Relaunch(projectRoot: string, config: CompilerConfig, _log: ILog) : Array<Promise<string>> {
        this.ClearAll(_log);
        const promises = new Array<Promise<string>>();
        for (const _srcdir of config.watchDirectories) {
            promises.push(this.doLaunch(_srcdir, projectRoot, config, _log));
        }
        return promises;
    }

    public GetWatchList(): Map<string, Array<number>> {
        return this.watchList;
    }

}

export function watchDirectory(srcdir: string, config: CompilerConfig) : Promise<string> {
    return  new Promise<string>(function(resolve, reject) {
        for(const watchDir of config.watchDirectories) {
            if (watchDir === srcdir) {
                reject(`${watchDir} already being watched`);
                return;
            }
        }
        config.watchDirectories.push(srcdir);
        resolve(`${srcdir} added successfully`);
    });
}

export function unwatchDirectory(srcdir: string, config: CompilerConfig) : Promise<string> {
    return  new Promise<string>(function(resolve, reject) {
        for(var i = 0; i < config.watchDirectories.length; ++i) {
            if (config.watchDirectories[i] === srcdir) {
                config.watchDirectories.splice(i, 1);
                resolve(`${srcdir} unwatched successfully`);
                return;
            }
        }
        reject(`${srcdir} not being watched before`);
    });
}