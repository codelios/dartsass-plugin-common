// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
"use strict";
import * as path from "path";
import browserslist from "browserslist";
import { CompilerConfig } from "./config";
import { Info } from "./version";
import { ILog } from "./log";
import { CSSFile, writeCSSFile } from "./cssfile";
const postcss = require("postcss");
import { Warning } from "postcss";
import autoprefixer from "autoprefixer";

function getProcessArgs(to: string, sourceMap: Buffer | null): any {
  if (sourceMap !== undefined && sourceMap !== null && sourceMap.length > 0) {
    return {
      to: to,
      map: {
        prev: sourceMap.toString(),
        inline: false,
      },
    };
  } else {
    return {
      to: to,
    };
  }
}

export async function doAutoprefixCSS(
  cssfile: CSSFile,
  config: CompilerConfig,
  to: string,
  _log: ILog
): Promise<CSSFile> {
  if (config.disableAutoPrefixer) {
    return cssfile;
  }
  const processor = postcss([
    autoprefixer({
      browsers: config.autoPrefixBrowsersList,
    }),
  ]);
  const result = await processor.process(
    cssfile.css.toString(),
    getProcessArgs(to, cssfile.sourceMap)
  );
  result.warnings().forEach((warn: Warning[]) => {
    _log.warning(`Autoprefixer: ${warn}`);
  });
  return {
    css: Buffer.from(result.css),
    sourceMap: config.disableSourceMap ? null : result.map,
  };
}

export async function autoPrefixCSSBytes(
  output: string,
  inFile: CSSFile,
  config: CompilerConfig,
  _log: ILog
): Promise<number> {
  const cssfile = await doAutoprefixCSS(
    inFile,
    config,
    path.basename(output),
    _log
  );
  const value = await writeCSSFile(cssfile, output, _log);
  return value;
}

export function getVersions(): Array<string> {
  const result = new Array<string>();

  const postcssInfo = (postcss as unknown) as Info;
  result.push(`PostCSS: ${postcssInfo.info}`);

  const autoprefixerInfo = (autoprefixer as unknown) as Info;
  result.push(`autoprefixer: ${autoprefixerInfo.info}`);

  const browserslistInfo = (browserslist as unknown) as Info;
  result.push(`browserslist: ${browserslistInfo.info}`);

  return result;
}
