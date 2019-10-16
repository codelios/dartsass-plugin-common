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

export interface WatchTarget {
    path: string;
    compressed: boolean;
}

export class Watcher {

    watchList: Map<WatchTarget, number>  = new Map<WatchTarget, number>();

    constructor() {
    }

    public Watch(_srcdir: string, projectRoot: string, compressed: boolean, config: CompilerConfig, _log: ILog): Promise<string> {
        const watchTarget =  <WatchTarget>({
            path: xformPath(projectRoot, _srcdir),
            compressed: compressed,
        });
        const self = this;
        return new Promise<string>(function(resolve, reject) {
            const pid = self.watchList.get(watchTarget);
            if (pid !== null && pid !== undefined) {
                reject(`${watchTarget.path} already being watched ( pid ${pid} )`);
                return;
            }
            getCurrentCompiler(config, _log).watch(watchTarget.path, projectRoot, compressed, config, _log).then(
                (value: ProcessOutput) => {
                    self.watchList.set(watchTarget, value.pid);
                    resolve('Good');
                },
                (err:ProcessOutput) => {
                    reject(err.msg);
                }
            );
        });
    }

    public ClearWatchDirectory(watchTarget: WatchTarget) {
        const pid = this.watchList.get(watchTarget);
        if (pid !== null && pid !== undefined) {
            killProcess(pid);
        }
        this.watchList.delete(watchTarget);
    }

    public ClearWatch(_srcdir: string, projectRoot: string, compressed: boolean) {
        const srcdir = xformPath(projectRoot, _srcdir);
        return this.ClearWatchDirectory(<WatchTarget>{
            path: srcdir,
            compressed: compressed
        });
    }

    public ClearAll() {
        this.watchList.forEach((value: number, key: WatchTarget) => {
            killProcess(value);
        });
        this.watchList.clear();
    }

    doVerifyProcess(pid: number): boolean {
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
        let count = 0;
        this.watchList.forEach((value: number, key: WatchTarget) => {
            if (!self.doVerifyProcess(value)) {
                self.watchList.delete(key);
                // Since process is not running anymore just delete it from the watch list
                count++;
            }
        });
        return count;
    }

    public GetWatchList(): Map<WatchTarget, number> {
        return this.watchList;
    }

}