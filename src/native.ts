// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";
import { CompilerConfig, SASSOutputFormat } from "./config";
import { IDocument } from "./document";
import { Log } from "./log";
import { Run, RunDetached, ProcessOutput, isWindows } from "./run";
import { xformPath, xformPaths } from "./util";
import {
  getWatchTargetDirectory,
  getOutputCSS,
  getRelativeDirectory,
} from "./target";
import { autoPrefixCSSBytes } from "./autoprefix";
import { readFileSync } from "./fileutil";
import { isBeingWatched } from "./compiler";
import util from "util";
import fs from "fs";

const VersionArgs = ["--version"];

/**
 * NativeCompiler uses the sass executable present in config.sassBinPath and uses the cmd line to compile the same.
 */
export class NativeCompiler {
  getSassBinPath(projectRoot: string, sassBinPath: string): string {
    return xformPath(projectRoot, sassBinPath);
  }

  verifySassBinPath(sassBinPath: string): boolean {
    return true;
  }

  public async sayVersion(
    config: CompilerConfig,
    projectRoot: string
  ): Promise<string> {
    const sassBinPath = this.getSassBinPath(projectRoot, config.sassBinPath);
    const args = VersionArgs;
    let runPromise = Run(sassBinPath, args, projectRoot);
    if (isWindows()) {
      const relativeCmd = getRelativeDirectory(projectRoot, sassBinPath);
      this.verifySassBinPath(relativeCmd);
      args.unshift(relativeCmd);
      runPromise = Run(config.nodeExePath, args, projectRoot);
    }
    return await runPromise;
  }

  public async validate(
    config: CompilerConfig,
    projectRoot: string
  ): Promise<string> {
    const sassBinPath = this.getSassBinPath(projectRoot, config.sassBinPath);
    if (!fs.existsSync(sassBinPath)) {
      throw new Error(
        `ProjectRoot: ${projectRoot}. Sass Binary Path ${sassBinPath} does not exist`
      );
    }
    if (fs.lstatSync(sassBinPath).isDirectory()) {
      throw new Error(
        `ProjectRoot: ${projectRoot}. Sass Binary Path ${sassBinPath} is a directory`
      );
    }
    return "";
  }

  async doCompileDocument(
    sassBinPath: string,
    output: string,
    config: CompilerConfig,
    cwd: string,
    args: string[]
  ): Promise<string> {
    let runPromise = Run(sassBinPath, args, cwd);
    if (isWindows()) {
      const relativeCmd = getRelativeDirectory(cwd, sassBinPath);
      this.verifySassBinPath(relativeCmd);
      args.unshift(relativeCmd);
      runPromise = Run(config.nodeExePath, args, cwd);
    }
    await runPromise;
    const data = readFileSync(output);
    await autoPrefixCSSBytes(
      output,
      {
        css: data,
        sourceMap: readFileSync(output + ".map"),
      },
      config
    );
    return output;
  }

  getArgs(
    document: IDocument,
    config: CompilerConfig,
    output: string,
    minified: boolean
  ): string[] {
    const result = this.doGetArgs(document.getProjectRoot(), config, minified);
    const input = document.getFileName();
    const base = document.getProjectRoot();
    result.push(
      util.format(
        "%s:%s",
        getRelativeDirectory(base, input),
        getRelativeDirectory(base, output)
      )
    );
    return result;
  }

  public async compileDocument(
    document: IDocument,
    config: CompilerConfig
  ): Promise<string> {
    const sassBinPath = this.getSassBinPath(
      document.getProjectRoot(),
      config.sassBinPath
    );
    if (isBeingWatched(document, config)) {
      return "Document already being watched";
    }
    let value = "";
    if (config.canCompileCSS()) {
      const output = getOutputCSS(document, config, false);
      const args = this.getArgs(document, config, output, false);
      value = await this.doCompileDocument(
        sassBinPath,
        output,
        config,
        document.getProjectRoot(),
        args
      );
    }
    if (!config.canCompileMinified()) {
      return value;
    }
    const minifiedOutput = getOutputCSS(document, config, true);
    const minArgs = this.getArgs(document, config, minifiedOutput, true);
    return await this.doCompileDocument(
      sassBinPath,
      minifiedOutput,
      config,
      document.getProjectRoot(),
      minArgs
    );
  }

  doGetArgs(
    projectRoot: string,
    config: CompilerConfig,
    minified: boolean
  ): Array<string> {
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
      if (relativePath.indexOf(" ") !== -1) {
        // has spaces in it so encode it better
        includePath = util.format('"%s"', relativePath);
      }
      result.push(includePath);
    }
    return result;
  }

  doGetWatchArgs(
    projectRoot: string,
    config: CompilerConfig,
    _srcdir: string
  ): Array<string> {
    const minified = config.outputFormat === SASSOutputFormat.MinifiedOnly;
    const args = this.doGetArgs(projectRoot, config, minified);
    args.push("--watch");
    const relativeSrcDir = getRelativeDirectory(projectRoot, _srcdir);
    const targetDirectory = getWatchTargetDirectory(relativeSrcDir, config);
    args.push(util.format("%s:%s", relativeSrcDir, targetDirectory));
    return args;
  }

  public watch(
    srcdir: string,
    projectRoot: string,
    config: CompilerConfig
  ): Promise<ProcessOutput> {
    const args = this.doGetWatchArgs(projectRoot, config, srcdir);
    const sassBinPath = this.getSassBinPath(projectRoot, config.sassBinPath);
    Log.debug(`Watching ${srcdir} by ${sassBinPath}.`);
    if (isWindows()) {
      const relativeCmd = getRelativeDirectory(projectRoot, sassBinPath);
      this.verifySassBinPath(relativeCmd);
      args.unshift(relativeCmd);
      return RunDetached(config.nodeExePath, projectRoot, args);
    } else {
      return RunDetached(sassBinPath, projectRoot, args);
    }
  }
}
