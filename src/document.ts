// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
"use strict";

export interface IDocument {
  isSass(): boolean;

  getFileName(): string;

  getFileOnly(): string;

  getProjectRoot(): string;
}
