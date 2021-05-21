// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";
import { Log } from "./log";
import { writeToFile, deleteFile } from "./fileutil";

export interface CSSFile {
  css: string;

  sourceMap: any;
}

async function writeSourceMap(
  value: any,
  sourceMapFile: string
): Promise<number> {
  if (value === undefined || value === null) {
    Log.debug(
      `Warning: sourcemap is null. Hence ${sourceMapFile} not being written but deleted`
    );
    deleteFile(sourceMapFile);
    return 0;
  } else {
    return writeToFile(sourceMapFile, value);
  }
}

export async function writeCSSFile(
  filename: string,
  cssfile: CSSFile,
): Promise<number> {
  await writeToFile(filename, cssfile.css);
  Log.debug(`wrote raw css file to ${filename}`);
  const sourceMapFile = filename + ".map";
  const value = await writeSourceMap(cssfile.sourceMap, sourceMapFile);
  Log.debug(`wrote css.map file to ${sourceMapFile}`);
  return value;
}
