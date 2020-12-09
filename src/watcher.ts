// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";
import * as path from "path";
import { CompilerConfig } from "./config";
import { ILog } from "./log";
import { ProcessOutput, killProcess, getWatcherPattern } from "./run";
import { xformPath } from "./util";
import { getCurrentCompiler } from "./select";
import { ISassCompiler } from "./compiler";
import { doAutoprefixCSS } from "./autoprefix";
import {
  getWatchTargetDirectory,
  isMinCSS,
  isCSSFile,
  getMinCSS,
  defaultMinCSSExtension,
} from "./target";
import { cssWatch, closeChokidarWatcher } from "./chokidar_util";
import { FSWatcher } from "chokidar";
import { IMinifier, getSourceMapComment } from "./minifier";
import { CSSFile, writeCSSFile } from "./cssfile";
import { CleanCSSMinifier } from "./cleancss";
import { deleteFile, readFileSync } from "./fileutil";
import { canCompileMinified } from "./outputformat";

const minifier: IMinifier = new CleanCSSMinifier();

const quirkyMinifiedFiles = `
** There is some quirkiness with sass watcher / chokidar that expects "dartsass.targetDirectory" to be set, for minified files to be generated as output **
`;

function doSingleLaunch(
  compiler: ISassCompiler,
  srcdir: string,
  projectRoot: string,
  config: CompilerConfig,
  _log: ILog
): Promise<ProcessOutput> {
  return compiler.watch(srcdir, projectRoot, config, _log);
}

function xformSourceMap(inputSourceMap: unknown): unknown {
  if (inputSourceMap === null) {
    return null;
  }
  if (inputSourceMap === undefined) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(inputSourceMap));
}

async function getTransformation(
  contents: CSSFile,
  config: CompilerConfig,
  to: string,
  minifier: IMinifier,
  _log: ILog
): Promise<CSSFile> {
  const cssfile = await doAutoprefixCSS(contents, config, to, _log);
  const output = xformSourceMap(cssfile.sourceMap);
  cssfile.sourceMap = output;
  const comments = getSourceMapComment(config.disableSourceMap, to + ".map");
  return await minifier.minify(cssfile, config.disableSourceMap, comments);
}

async function _internalMinify(
  cwd: string,
  _docPath: string,
  config: CompilerConfig,
  _log: ILog
): Promise<void> {
  const fqPath = path.join(cwd, _docPath);
  _log.debug(`File changed ${fqPath}`);
  if (!isCSSFile(fqPath)) {
    return;
  }
  if (isMinCSS(fqPath, defaultMinCSSExtension)) {
    return;
  }
  const minifiedCSS = getMinCSS(fqPath, defaultMinCSSExtension);
  const sourceMapFile = minifiedCSS + ".map";
  const inputSourceMapFile = fqPath + ".map";
  _log.debug(
    `About to minify ${fqPath} (inputSourceMap: ${inputSourceMapFile}) to ${minifiedCSS}  (sourcemap: ${sourceMapFile})`
  );
  const inputCSSFile = {
    css: readFileSync(fqPath),
    sourceMap: config.disableSourceMap
      ? null
      : readFileSync(inputSourceMapFile),
  };
  const minifiedFileOnly = path.basename(minifiedCSS);
  const cssfile = await getTransformation(
    inputCSSFile,
    config,
    minifiedFileOnly,
    minifier,
    _log
  );
  await writeCSSFile(cssfile, minifiedCSS, _log);
  _log.debug(`Wrote to ${minifiedCSS}[.map]`);
  return;
}

function doDelete(docPath: string, config: CompilerConfig, _log: ILog): any {
  _log.debug(`Deletion event received for ${docPath}`);
  if (!isCSSFile(docPath)) {
    return;
  }
  if (isMinCSS(docPath, defaultMinCSSExtension)) {
    return;
  }
  const minifiedCSS = getMinCSS(docPath, defaultMinCSSExtension);
  deleteFile(minifiedCSS, _log);
}

function doMinify(
  srcdir: string,
  projectRoot: string,
  config: CompilerConfig,
  _log: ILog
): FSWatcher | null {
  if (!canCompileMinified(config.outputFormat)) {
    return null;
  }
  if (config.targetDirectory.length === 0) {
    _log.notify(`${quirkyMinifiedFiles}`);
    return null;
  }
  const targetDirectory = xformPath(
    projectRoot,
    getWatchTargetDirectory(srcdir, config)
  );
  const cwd = path.dirname(targetDirectory);
  const pattern = getWatcherPattern(path.basename(targetDirectory), "css");
  const fsWatcher = cssWatch(
    pattern,
    (docPath: string) => {
      _internalMinify(cwd, docPath, config, _log);
    },
    (docPath: string) => {
      doDelete(docPath, config, _log);
    },
    cwd,
    _log
  );
  _log.debug(`Started chokidar watcher for ${targetDirectory}`);
  return fsWatcher;
}

export interface WatchInfo {
  pid: number;

  fsWatcher: FSWatcher | null;
}

export class Watcher {
  watchList: Map<string, WatchInfo> = new Map<string, WatchInfo>();

  async doLaunch(
    _srcdir: string,
    projectRoot: string,
    config: CompilerConfig,
    _log: ILog
  ): Promise<string> {
    const srcdir = xformPath(projectRoot, _srcdir);
    const compiler = getCurrentCompiler(config, _log);
    const pids = this.watchList.get(srcdir);
    if (pids !== null && pids !== undefined) {
      throw new Error(`${srcdir} already being watched ( pids ${pids} )`);
    }
    const existingOutputFormat = config.outputFormat;
    const value = await doSingleLaunch(
      compiler,
      srcdir,
      projectRoot,
      config,
      _log
    );
    if (value.killed) {
      throw new Error(
        `Unable to launch sass watcher for ${srcdir}. process killed. Please check sassBinPath property.`
      );
    }
    if (value.pid === undefined || value.pid === null || value.pid <= 0) {
      this.watchList.delete(srcdir);
      throw new Error(
        `Unable to launch sass watcher for ${srcdir}. pid is undefined. Please check sassBinPath property.`
      );
    }
    config.outputFormat = existingOutputFormat;
    const fsWatcher = doMinify(srcdir, projectRoot, config, _log);
    this.watchList.set(srcdir, {
      pid: value.pid,
      fsWatcher: fsWatcher,
    });
    return `Launched scss/sass watchers`;
  }

  public ClearWatchDirectory(srcdir: string, _log: ILog): boolean {
    const watchInfo = this.watchList.get(srcdir);
    let cleared = false;
    if (watchInfo !== null && watchInfo !== undefined) {
      _log.debug(
        `About to unwatch ${srcdir} with sass watcher pid ${watchInfo.pid}`
      );
      killProcess(watchInfo.pid, _log);
      if (watchInfo.fsWatcher !== undefined && watchInfo.fsWatcher !== null) {
        _log.debug(
          `About to clear chokidar watcher for sass watcher pid ${watchInfo.pid}`
        );
        closeChokidarWatcher(watchInfo.fsWatcher, _log);
      } else {
        _log.debug(
          `No chokidar watcher for ${srcdir}, sass watcher pid ${watchInfo.pid}`
        );
      }
      cleared = true;
    } else {
      _log.debug(
        `Trying to unwatch ${srcdir}. But no watcher launched earlier`
      );
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
      _log.debug(`Unwatching ${key} with pid ${watchInfo.pid}`);
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
  public Relaunch(
    projectRoot: string,
    config: CompilerConfig,
    _log: ILog
  ): Array<Promise<string>> {
    this.ClearAll(_log);
    return config.watchDirectories.map((_srcdir: string, _: number) => {
      return this.doLaunch(_srcdir, projectRoot, config, _log);
    });
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
export async function watchDirectory(
  srcdir: string,
  config: CompilerConfig
): Promise<boolean> {
  for (const watchDir of config.watchDirectories) {
    if (watchDir === srcdir) {
      return false;
    }
  }
  config.watchDirectories.push(srcdir);
  return true;
}

export async function unwatchDirectory(
  srcdir: string,
  config: CompilerConfig
): Promise<string> {
  for (let i = 0; i < config.watchDirectories.length; ++i) {
    if (config.watchDirectories[i] === srcdir) {
      config.watchDirectories.splice(i, 1);
      return `${srcdir} unwatched successfully`;
    }
  }
  throw new Error(`${srcdir} not being watched before`);
}
