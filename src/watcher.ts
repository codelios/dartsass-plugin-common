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

export class Watcher {

    watchList: Map<string, number>  = new Map<string, number>();

    constructor() {
    }

    public doLaunch(_srcdir: string, projectRoot: string, config: CompilerConfig, _log: ILog): Promise<string> {
        const srcdir =  xformPath(projectRoot, _srcdir);
        const self = this;
        return new Promise<string>(function(resolve, reject) {
            const pid = self.watchList.get(srcdir);
            if (pid !== null && pid !== undefined) {
                reject(`${srcdir} already being watched ( pid ${pid} )`);
                return;
            }
            getCurrentCompiler(config, _log).watch(srcdir, projectRoot, config, _log).then(
                (value: ProcessOutput) => {
                    self.watchList.set(srcdir, value.pid);
                    resolve('Good');
                },
                (err:ProcessOutput) => {
                    reject(err.msg);
                }
            );
        });
    }

    public ClearWatchDirectory(srcdir: string, _log: ILog) : boolean {
        const pid = this.watchList.get(srcdir);
        let cleared = false;
        if (pid !== null && pid !== undefined) {
            killProcess(pid);
            cleared = true;
            _log.appendLine(`About to unwatch ${srcdir} with pid ${pid}`);
        }
        this.watchList.delete(srcdir);
        return cleared;
    }

    public ClearWatch(_srcdir: string, projectRoot: string, _log: ILog): boolean {
        const srcdir = xformPath(projectRoot, _srcdir);
        return this.ClearWatchDirectory(srcdir, _log);
    }

    public ClearAll(_log: ILog) {
        this.watchList.forEach((value: number, key: string) => {
            _log.appendLine(`Unwatching ${key}`);
            killProcess(value);
        });
        this.watchList.clear();
    }

    /**
     * Relaunch relaunches all the watch processes for the watch directories
     */
    public Relaunch(projectRoot: string, config: CompilerConfig, _log: ILog) {
        this.ClearAll(_log);
        for (const _srcdir of config.watchDirectories) {
            this.doLaunch(_srcdir, projectRoot, config, _log).then(
                value => {
                },
                err => {
                    _log.appendLine(err);
                }
            );
        }
    }

    public GetWatchList(): Map<string, number> {
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