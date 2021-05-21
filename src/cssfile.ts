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
  src: CSSFile,
  output: string
): Promise<number> {
  await writeToFile(output, src.css);
  Log.debug(`wrote raw css file to ${output}`);
  const sourceMapFile = output + ".map";
  const value = await writeSourceMap(src.sourceMap, sourceMapFile);
  Log.debug(`wrote css.map file to ${sourceMapFile}`);
  return value;
}
