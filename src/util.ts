// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";
import * as path from "path";

function xformPathFromRoot(projectRoot: string, entry: string): string {
  if (path.isAbsolute(entry)) {
    return entry;
  }
  return path.join(projectRoot, entry);
}

function xformPathsFromRoot(
  projectRoot: string,
  includePath: Array<string>
): Array<string> {
  const output: Array<string> = new Array<string>();
  includePath.forEach(function (entry: string) {
    output.push(xformPathFromRoot(projectRoot, entry));
  });
  return output;
}

export function xformPath(projectRoot: string, entry: string): string {
  if (!projectRoot) {
    return entry;
  }
  return xformPathFromRoot(projectRoot, entry);
}

export function xformPaths(
  projectRoot: string,
  includePath: Array<string>
): Array<string> {
  if (!projectRoot) {
    return includePath;
  }
  return xformPathsFromRoot(projectRoot, includePath);
}
