// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";
import { ILog } from "./log";
import { writeToFile, deleteFile } from "./fileutil";

export interface CSSFile {
  css: Buffer;

  sourceMap: any;
}

async function writeSourceMap(
  value: any,
  sourceMapFile: string,
  _log: ILog
): Promise<number> {
  if (value === undefined || value === null) {
    _log.debug(
      `Warning: sourcemap is null. Hence ${sourceMapFile} not being written but deleted`
    );
    deleteFile(sourceMapFile, _log);
    return 0;
  } else {
    return writeToFile(sourceMapFile, value, _log);
  }
}

export async function writeCSSFile(
  src: CSSFile,
  output: string,
  _log: ILog
): Promise<number> {
  await writeToFile(output, src.css, _log);
  const sourceMapFile = output + ".map";
  return await writeSourceMap(src.sourceMap, sourceMapFile, _log);
}
