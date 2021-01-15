// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
"use strict";

export const DefaultBrowsersList: Array<string> = ["> 1%", "last 2 versions"];

export enum SASSOutputFormat {
  Both = 1,
  CompiledCSSOnly,
  MinifiedOnly,
}

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

  canCompileCSS(): boolean {
    const outputformat = this.outputFormat;
    return (
      outputformat === SASSOutputFormat.Both ||
      outputformat === SASSOutputFormat.CompiledCSSOnly
    );
  }

  canCompileMinified(): boolean {
    const outputformat = this.outputFormat;
    return (
      outputformat === SASSOutputFormat.Both ||
      outputformat === SASSOutputFormat.MinifiedOnly
    );
  }

}
