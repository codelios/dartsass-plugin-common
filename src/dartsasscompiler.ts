// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";
import * as path from "path";
import { CompilerConfig } from "./config";
import { xformPaths } from "./util";
import { IDocument } from "./document";
import { Log } from "./log";
import { getOutputCSS } from "./target";
import { autoPrefixCSSBytes } from "./autoprefix";
import { ProcessOutput } from "./run";
import { Info } from "./version";

import sass = require("sass");

const NativeSassMessage = `
    The watcher functionality needs native sass binary to be installed in your machine.
    Installation Cmd: npm install sass@1.25.0 (say).
    After installation, please set "dartsass.sassBinPath": "node_modules/.bin/sass" (Linux) or
    "dartsass.sassBinPath": "node_modules\\sass\\sass.js"     (Windows) after installation for watcher to work.
`;

/**
 * Compile a given sass file based on DartSass implementation.
 *
 * More details of the API at -
 * https://github.com/sass/dart-sass/blob/master/README.md#javascript-api .
 */
export class DartSassCompiler {
  public async validate(
    config: CompilerConfig,
    projectRoot: string
  ): Promise<string> {
    return "";
  }

  public async sayVersion(
    config: CompilerConfig,
    projectRoot: string,
  ): Promise<string> {
    const info = (sass as unknown) as Info;
    const version = info.info;
    return version;
  }

  public async compileDocument(
    document: IDocument,
    config: CompilerConfig,
  ): Promise<string> {
    const output = getOutputCSS(document, config, false);
    Log.debug(
      `${document.getFileName()} -> ${output}, include path: ${config.includePath.join(
        ","
      )}`
    );
    if (config.canCompileCSS()) {
      await this.asyncCompile(document, false, output, config);
    }
    if (!config.canCompileMinified()) {
      return "";
    }
    const compressedOutput = getOutputCSS(document, config, true);
    await this.asyncCompile(document, true, compressedOutput, config);
    return "";
  }

  public async watch(
    srcdir: string,
    projectRoot: string,
    config: CompilerConfig
  ): Promise<ProcessOutput> {
    throw new Error(NativeSassMessage);
  }

  handleError(
    err: sass.SassException,
    config: CompilerConfig
  ): string {
    const fileonly = path.basename(err.file);
    const formattedMessage = ` ${err.line}:${err.column} ${err.formatted}`;
    Log.warning(`${err.formatted}`);
    return `${fileonly}: ${formattedMessage}`;
  }

  async asyncCompile(
    document: IDocument,
    compressed: boolean,
    output: string,
    config: CompilerConfig
  ): Promise<string> {
    const includePaths = xformPaths(
      document.getProjectRoot(),
      config.includePath
    );
    Log.debug(
      `asyncCompile (compileOnSave) ${document.getFileName()} to ${output}, IncludePaths: ${includePaths}, minified: ${compressed}`
    );
    try {
      const result = sass.renderSync({
        file: document.getFileName(),
        includePaths: includePaths,
        outputStyle: compressed ? "compressed" : "expanded",
        outFile: output,
        sourceMap: !config.disableSourceMap,
      });
      Log.debug(
        `Completed asyncCompile(compileOnSave) ${document.getFileName()} to ${output}. Starting autoprefix - sourceMap`
      );
      const inputCSSFile = {
        css: result.css.toString(config.sourceEncoding),
        sourceMap: (result.map ? result.map.toString() : null),
      };
      const value = await autoPrefixCSSBytes(output, inputCSSFile, config);
      return `${value}`;
    } catch (err) {
      const msg = this.handleError(err as sass.SassException, config);
      throw new Error(`${msg}`);
    }
  }
}
