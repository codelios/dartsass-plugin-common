// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';

import { CompilerConfig } from './config';
import { ILog } from './log';
import { ProcessOutput, killProcess } from './run';
import { ISassCompiler } from './compiler';
import { xformPath } from './util';

export class Watcher {

    watchList: Map<string, number>  = new Map<string, number>();

    constructor() {
    }

    public Watch(compiler: ISassCompiler, _srcdir: string, projectRoot: string, config: CompilerConfig, _log: ILog): Promise<string> {
        const srcdir = xformPath(projectRoot, _srcdir);
        const self = this;
        return new Promise<string>(function(resolve, reject) {
            compiler.watch(srcdir, projectRoot, config, _log).then(
                (value: ProcessOutput) => {
                    self.watchList.set(srcdir, value.pid);
                    resolve('Good');
                },
                err => reject(err)
            );
        });
    }

    public ClearWatch(_srcdir: string, projectRoot: string) {
        const srcdir = xformPath(projectRoot, _srcdir);
        const pid = this.watchList.get(srcdir);
        if (pid !== null && pid !== undefined) {
            killProcess(pid);
        }
        this.watchList.delete(srcdir);
    }

    public ClearAll(projectRoot: string) {
        const self = this;
        this.watchList.forEach((value: number, key: string) => {
            self.ClearWatch(key, projectRoot);
        });
    }

    public GetWatchList(): Map<string, number> {
        return this.watchList;
    }

}