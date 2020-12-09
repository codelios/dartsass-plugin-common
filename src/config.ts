// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
"use strict";

import { SASSOutputFormat } from "./outputformat";

export const DefaultBrowsersList: Array<string> = ["> 1%", "last 2 versions"];

export class CompilerConfig {
  sassBinPath = "";

  includePath: Array<string> = [];

  outputFormat: SASSOutputFormat = SASSOutputFormat.Both;

  disableSourceMap = false;

  sourceEncoding = "utf-8";

  nodeExePath = "node.exe";

  debug = false;

  disableCompileOnSave = false;

  pauseInterval = 3;

  enableStartWithUnderscores = false;

  disableAutoPrefixer = false;

  autoPrefixBrowsersList: Array<string> = DefaultBrowsersList;

  targetDirectory = "";

  watchDirectories: Array<string> = [];
}
