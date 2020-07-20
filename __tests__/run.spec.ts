// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";
import "mocha";
import { validateCmd } from "../src/run";
import { getNullLog } from "./log";

import { expect } from "chai";

describe("validateCmd", () => {
  it("no spaces", () => {
    const _log = getNullLog();
    expect(validateCmd("node_modules/.bin/sass", ["--version"], _log)).to.equal(
      true
    );
  });

  it("spaces in args", () => {
    const _log = getNullLog();
    expect(
      validateCmd("node_modules/.bin/sass", [" --version"], _log)
    ).to.equal(false);
  });
  it("spaces in includepath", () => {
    const _log = getNullLog();
    expect(
      validateCmd("node_modules/.bin/sass", ["-I", "My Folder"], _log)
    ).to.equal(false);
  });
});
