// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import * as path from 'path';
import { CompilerConfig } from './config';
import { ILog } from './log';
import { ProcessOutput, killProcess, getWatcherPattern } from './run';
import { xformPath } from './util';
import { getCurrentCompiler } from './select';
import { ISassCompiler } from './compiler';
import { doAutoprefixCSS } from './autoprefix';
import { getWatchTargetDirectory, isMinCSS, isCSSFile, getMinCSS  } from './target';
import { cssWatch, closeChokidarWatcher} from './chokidar_util';
import { FSWatcher } from 'chokidar';
import { IMinifier, getSourceMapComment } from './minifier';
import { CSSFile, writeCSSFile } from './cssfile';
import { CleanCSSMinifier } from './cleancss';
import { deleteFile, readFileSync } from './fileutil';

const minifier: IMinifier = new CleanCSSMinifier();

const quirkyMinifiedFiles = `
** There is some quirkiness with sass watcher / chokidar that expects "dartsass.targetDirectory" to be set, for minified files to be generated as output **
`;

function doSingleLaunch(compiler: ISassCompiler, srcdir: string, projectRoot: string,
    config: CompilerConfig, _log: ILog): Promise<ProcessOutput> {
    return compiler.watch(srcdir, projectRoot, config, _log);
}

function xformSourceMap(inputSourceMap: any): any {
    if (inputSourceMap === null) {
        return null;
    }
    if (inputSourceMap === undefined) {
        return undefined;
    }
    return JSON.parse(JSON.stringify(inputSourceMap));
}


function getTransformation(contents: CSSFile, config: CompilerConfig, to: string, minifier: IMinifier, _log: ILog) : Promise<CSSFile> {
    return new Promise<CSSFile>(function(resolve, reject) {
        doAutoprefixCSS(contents, config, to, _log).then(
            (value: CSSFile) => {
                const output = xformSourceMap(value.sourceMap);
                value.sourceMap = output;
                const comments = getSourceMapComment(config.disableSourceMap, to+".map");
                minifier.minify(value, config.disableSourceMap, comments).then(
                    (minifiedValue:CSSFile) => {
                        resolve(minifiedValue);
                    },
                    err => {
                        _log.debug(`Error running minifier - ${value.sourceMap} ( ${typeof(value.sourceMap)} ) - value.css.length: ${value.css.length} - ${err}`);
                        reject(err);
                    }
                );
            },
            err => {
                _log.debug(`Error running autoprefixer: ${contents.sourceMap}  ( sourceMap: ${typeof(contents.sourceMap)}, css: ${typeof(contents.css)} ) - contents.css.toString().length: ${contents.css.toString().length} - ${err}`);
                reject(err);
            }
        );
    });
}

function _internalMinify(cwd: string, _docPath: string, config: CompilerConfig, _log: ILog): void {
    const fqPath = path.join(cwd, _docPath);
    _log.debug(`File changed ${fqPath}`);
    if (!isCSSFile(fqPath)) {
        return;
    }
    if (isMinCSS(fqPath, config.minCSSExtension)) {
        return;
    }
    const minifiedCSS = getMinCSS(fqPath, config.minCSSExtension);
    const sourceMapFile = minifiedCSS + ".map";
    const inputSourceMapFile = fqPath + ".map";
    _log.debug(`About to minify ${fqPath} (inputSourceMap: ${inputSourceMapFile}) to ${minifiedCSS}  (sourcemap: ${sourceMapFile})`);
    const inputCSSFile = {
        css: readFileSync(fqPath),
        sourceMap: (config.disableSourceMap ? null : readFileSync(inputSourceMapFile))
    };
    const minifiedFileOnly = path.basename(minifiedCSS);
    getTransformation(inputCSSFile, config, minifiedFileOnly, minifier, _log).then(
        (value: CSSFile) => {
            writeCSSFile(value, minifiedCSS, _log).then(
                (written: number) => {
                    _log.debug(`Wrote to ${minifiedCSS}[.map]`)
                },
                err =>_log.debug(`Error writing css file to ${minifiedCSS} - ${err}`)
            );
        },
        err => _log.debug(`Error transforming file ${minifiedCSS} - ${err}`)
    );
}

function doDelete(docPath: string, config: CompilerConfig, _log: ILog): any {
    _log.debug(`Deletion event received for ${docPath}`);
    if (!isCSSFile(docPath)) {
        return;
    }
    if (isMinCSS(docPath, config.minCSSExtension)) {
        return;
    }
    const minifiedCSS = getMinCSS(docPath, config.minCSSExtension);
    deleteFile(minifiedCSS, _log);
}

function doMinify(srcdir: string, projectRoot: string, config: CompilerConfig, _log: ILog): (FSWatcher | null) {
    if (config.disableMinifiedFileGeneration) {
        return null;
    }
    const targetDirectory = xformPath(projectRoot, getWatchTargetDirectory(srcdir, config));
    const cwd = path.dirname(targetDirectory);
    const pattern = getWatcherPattern(path.basename(targetDirectory), "css");
    const fsWatcher = cssWatch(pattern, (docPath: string) => {
        _internalMinify(cwd, docPath, config, _log);
    },
    (docPath: string) => {
        doDelete(docPath, config, _log);
    }, cwd, _log);
    _log.debug(`Started chokidar watcher for ${targetDirectory}`);
    return fsWatcher;
}


export interface WatchInfo {
    pid: number;

    fsWatcher: FSWatcher | null;
}

export class Watcher {

    watchList: Map<string, WatchInfo>  = new Map<string, WatchInfo>();

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
            doSingleLaunch(compiler, srcdir, projectRoot, config, _log).then(
                (value: ProcessOutput) => {
                    if (value.killed) {
                        reject(`Unable to launch sass watcher for ${srcdir}. process killed. Please check sassBinPath property.`);
                        return;
                    }
                    if (value.pid === undefined || value.pid === null || value.pid <= 0) {
                        self.watchList.delete(srcdir);
                        reject(`Unable to launch sass watcher for ${srcdir}. pid is undefined. Please check sassBinPath property.`);
                        return;
                    }
                    let fsWatcher = null;
                    if (config.targetDirectory.length === 0) {
                        _log.appendLine(`Warning: ${quirkyMinifiedFiles}`);
                    } else {
                        fsWatcher = doMinify(srcdir, projectRoot, config, _log);
                    }
                    self.watchList.set(srcdir, {
                        pid: value.pid,
                        fsWatcher: fsWatcher
                    });
                    resolve(`Launched css watchers`);
                },
                err => {
                    reject(`${srcdir} - ${err}`);
                }
            );
        });
    }

    public ClearWatchDirectory(srcdir: string, _log: ILog) : boolean {
        const watchInfo = this.watchList.get(srcdir);
        let cleared = false;
        if (watchInfo !== null && watchInfo !== undefined) {
            _log.appendLine(`About to unwatch ${srcdir} with sass watcher pid ${watchInfo.pid}`);
            killProcess(watchInfo.pid, _log);
            if (watchInfo.fsWatcher !== undefined && watchInfo.fsWatcher !== null) {
                _log.appendLine(`About to clear chokidar watcher for sass watcher pid ${watchInfo.pid}`);
                closeChokidarWatcher(watchInfo.fsWatcher, _log);
            } else {
                _log.appendLine(`No chokidar watcher for ${srcdir}, sass watcher pid ${watchInfo.pid}`);
            }
            cleared = true;
        } else {
            _log.appendLine(`Trying to unwatch ${srcdir}. But no watcher launched earlier`);
            cleared = true;
        }
        this.watchList.delete(srcdir);
        return cleared;
    }

    public ClearWatch(_srcdir: string, projectRoot: string, _log: ILog): boolean {
        const srcdir = xformPath(projectRoot, _srcdir);
        return this.ClearWatchDirectory(srcdir, _log);
    }

    public ClearAll(_log: ILog) {
        this.watchList.forEach((watchInfo: WatchInfo, key: string) => {
            _log.appendLine(`Unwatching ${key} with pid ${watchInfo.pid}`);
            killProcess(watchInfo.pid, _log);
            if (watchInfo.fsWatcher !== undefined && watchInfo.fsWatcher !== null) {
                closeChokidarWatcher(watchInfo.fsWatcher, _log);
            }
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

    public GetWatchList(): Map<string, WatchInfo> {
        return this.watchList;
    }

}

/**
 * watchDirectory adds a given directory to the list of directories being watched.
 *
 * Returns false, if directory already being watched. true, if the directory is being watched anew.
 * @param srcdir
 * @param config
 */
export function watchDirectory(srcdir: string, config: CompilerConfig) : Promise<boolean> {
    return  new Promise<boolean>(function(resolve, reject) {
        for(const watchDir of config.watchDirectories) {
            if (watchDir === srcdir) {
                resolve(false);
                return;
            }
        }
        config.watchDirectories.push(srcdir);
        resolve(true);
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

