// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
"use strict";
import * as path from "path";
import browserslist from "browserslist";
import { CompilerConfig } from "./config";
import { Info } from "./version";
import { Log } from "./log";
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
  to: string
): Promise<CSSFile> {
  if (config.disableAutoPrefixer) {
    return cssfile;
  }
  const processor = postcss([autoprefixer(config.autoPrefixBrowsersList)]);
  Log.debug(`Postcss: About to process`);
  const result = await processor.process(
    cssfile.css,
    getProcessArgs(to, cssfile.sourceMap)
  );
  Log.debug(`Postcss: processor.process completed`);
  result.warnings().forEach((warn: Warning[]) => {
    Log.warning(`Autoprefixer: ${warn}`);
  });
  Log.debug(`Typeof result.css ${typeof result.css}`)
  return {
    css: result.css,
    sourceMap: config.disableSourceMap ? null
      : (result.map ? result.map.toString() : null),
  };
}

export async function autoPrefixCSSBytes(
  output: string,
  inFile: CSSFile,
  config: CompilerConfig
): Promise<number> {
  const cssfile = await doAutoprefixCSS(inFile, config, path.basename(output));
  Log.debug(`doAutoprefixCSS completed to ${output}`);
  const value = await writeCSSFile(output, cssfile);
  Log.debug(`writeCSSFile completed to ${output}`);
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
