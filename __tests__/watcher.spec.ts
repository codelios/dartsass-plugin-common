// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";
import { expect } from "chai";
import "mocha";
import { CompilerConfig } from "../src/config";
import { getNullLog, getConsoleLog } from "./log";
import { Watcher, watchDirectory, unwatchDirectory } from "../src/watcher";

const path = require("path");

describe("doLaunch", () => {
  it("doLaunch compressed = false", (done) => {
    const watcher = new Watcher();
    const config = new CompilerConfig();
    config.targetDirectory = "out";
    config.sassBinPath = "/usr/local/bin/sass";
    const _log = getNullLog();
    const srcdir = path.join(__dirname, "input");
    config.disableMinifiedFileGeneration = true;
    watcher
      .doLaunch(srcdir, __dirname, config, _log)
      .then(
        (result) => {
          const watchList = watcher.GetWatchList();
          expect(watchList.size).to.be.equal(1);
          expect(watcher.ClearWatch(srcdir, __dirname, _log)).to.be.true;
          expect(watchList.size).to.be.equal(0);
        },
        (err) => {
          expect(err).to.be.null;
        }
      )
      .finally(done);
  });

  it("doLaunch compressed = true", (done) => {
    const watcher = new Watcher();
    const config = new CompilerConfig();
    config.targetDirectory = "out";
    config.sassBinPath = "/usr/local/bin/sass";
    const _log = getNullLog();
    const srcdir = path.join(__dirname, "input");
    watcher
      .doLaunch(srcdir, __dirname, config, _log)
      .then(
        (result) => {
          const watchList = watcher.GetWatchList();
          expect(watchList.size).to.be.equal(1);
          expect(watcher.ClearWatch(srcdir, __dirname, _log)).to.be.true;
          expect(watchList.size).to.be.equal(0);
        },
        (err) => {
          expect(err).to.be.null;
        }
      )
      .finally(done);
  });

  it("relaunch", (done) => {
    const watcher = new Watcher();
    const config = new CompilerConfig();
    config.targetDirectory = "out";
    config.sassBinPath = "/usr/local/bin/sass";
    const _log = getConsoleLog();
    const srcdir = path.join(__dirname, "input");
    config.watchDirectories.push(srcdir);
    const promises = watcher.Relaunch(__dirname, config, _log);
    for (const promise of promises) {
      promise
        .then(
          (result) => {
            expect(watcher.ClearWatchDirectory(srcdir, _log)).to.be.equal(true);
          },
          (err) => {
            expect(err).to.be.null;
          }
        )
        .finally(done);
    }
  });

  it("watchDirectoryCycle", () => {
    const config = new CompilerConfig();
    const srcdir = path.join(__dirname, "input");
    watchDirectory(srcdir, config);
    expect(config.watchDirectories.length).to.be.equal(1);
    unwatchDirectory(srcdir, config);
    expect(config.watchDirectories.length).to.be.equal(0);
  });
});
