// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
"use strict";

export enum SASSOutputFormat {
  Both = 1,
  CompiledCSSOnly,
  MinifiedOnly,
}

export function canCompileCSS(outputformat: SASSOutputFormat): boolean {
  return (
    outputformat === SASSOutputFormat.Both ||
    outputformat === SASSOutputFormat.CompiledCSSOnly
  );
}

export function canCompileMinified(outputformat: SASSOutputFormat): boolean {
  return (
    outputformat === SASSOutputFormat.Both ||
    outputformat === SASSOutputFormat.MinifiedOnly
  );
}
