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

    public Watch(_srcdir: string, projectRoot: string, config: CompilerConfig, _log: ILog): Promise<string> {
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

    doVerify(pid: number): boolean {
        // TODO: Check if the pid is still running so it can be cleaned up
        return true;
    }

    /**
     * Refresh verifies if the processes represented by the PID are still running.
     *
     * Returns the number of processes that do not run anymore.
     */
    public Refresh(): number {
        const self = this;
        const toDelete = new Array<string>();
        this.watchList.forEach((value: number, key: string) => {
            if (!self.doVerify(value)) {
                toDelete.push(key);
                // Since process is not running anymore just delete it from the watch list
            }
        });
        toDelete.forEach(value => {
            self.watchList.delete(value);
        })
        return toDelete.length;
    }

    /**
     * Relaunch relaunches all the processes running
     */
    public Relaunch(projectRoot: string, config: CompilerConfig, _log: ILog) {
        const keys = Array.from(this.watchList.keys());
        this.ClearAll(_log);
        for (const _srcdir of keys) {
            this.Watch(_srcdir, projectRoot, config, _log).then(
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