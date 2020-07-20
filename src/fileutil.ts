// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";
import fs from "fs";
import { ILog } from "./log";

export async function writeToFile(
  outPath: string,
  data: Buffer,
  _log: ILog
): Promise<number> {
  if (data === undefined || data === null) {
    return 0;
  }
  await fs.promises.writeFile(outPath, data);
  return data.length;
}

export function deleteFile(docPath: string, _log: ILog) {
  try {
    fs.unlink(docPath, function (err) {
      if (err) {
        _log.error(`Error deleting ${docPath} - ${err}`);
      }
      _log.debug(`Deleted ${docPath} successfully`);
    });
  } catch (err) {
    _log.error(`Error deleting ${docPath} - ${err}`);
  }
}

export function readFileSync(docPath: string): Buffer {
  if (fs.existsSync(docPath)) {
    return fs.readFileSync(docPath);
  } else {
    return Buffer.from("");
  }
}
