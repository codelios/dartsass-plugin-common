// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";
import { expect } from "chai";
import "mocha";
import * as fs from "fs";
import path from "path";
import { NativeCompiler } from "../src/native";
import { IDocument } from "../src/document";
import { CompilerConfig } from "../src/config";
import { getDocumentForFile } from "./document";
import { getNullLog, getBufLog } from "./log";
import { getLocalSass } from "./testutil";

describe("Native SayVersion", () => {
  let localSass: string;

  before(function (done) {
    localSass = getLocalSass();
    if (!fs.existsSync(localSass)) {
      done(`${localSass} does not exist`);
    } else {
      done();
    }
  });

  it("sayVersion", (done) => {
    const native = new NativeCompiler();
    const config = new CompilerConfig();
    config.sassBinPath = localSass;
    const _log = getBufLog();
    native.sayVersion(config, "", _log).then(
      (data: string) => {
        expect(data).to.match(/compiled with dart2js/);
        done();
      },
      (err) => {
        done(err);
      }
    );
  });
});

describe("Native CompileDocument", () => {
  let localSass: string;

  before(function (done) {
    localSass = getLocalSass();
    if (!fs.existsSync(localSass)) {
      done(`${localSass} does not exist`);
    } else {
      done();
    }
  });

  it("compileDocument correct", (done) => {
    const native = new NativeCompiler();
    const document: IDocument = getDocumentForFile("cmd.scss");
    const config = new CompilerConfig();
    config.targetDirectory = "out";
    config.sassBinPath = localSass;
    config.disableMinifiedFileGeneration = true;
    const _log = getNullLog();
    native.compileDocument(document, config, _log).then(
      (result) => {
        const output = path.join(document.getProjectRoot(), "out/cmd.css");
        expect(result).to.equal(output);
        done();
      },
      (err) => {
        done(err);
      }
    );
  });

  it("compileDocument invalid/nonexistent/incorrect scss should result in error", (done) => {
    const native = new NativeCompiler();
    const document: IDocument = getDocumentForFile("invalid.scss");
    const config = new CompilerConfig();
    config.targetDirectory = "out";
    config.sassBinPath = localSass;
    const _log = getNullLog();
    native
      .compileDocument(document, config, _log)
      .then(
        (result) => {
          expect(result).to.be.null;
        },
        (err) => {
          expect(err).to.be.not.null;
        }
      )
      .finally(done);
  });

  it("compileDocument autoprefix", (done) => {
    const native = new NativeCompiler();
    const document: IDocument = getDocumentForFile("autoprefixer_example.scss");
    const config = new CompilerConfig();
    config.targetDirectory = "out";
    config.sassBinPath = localSass;
    config.autoPrefixBrowsersList = ["last 2 version"];
    config.disableMinifiedFileGeneration = true;
    const _log = getNullLog();
    native.compileDocument(document, config, _log).then(
      (result) => {
        const output = path.join(
          document.getProjectRoot(),
          "out/autoprefixer_example.css"
        );
        const normalOuput = path.join(
          document.getProjectRoot(),
          "out/autoprefixer_example.css"
        );
        expect(result).to.equal(output);
        fs.readFile(output, "utf8", function (err, contents) {
          if (err) {
            expect(err).to.be.null;
            return;
          }
          expect(
            contents.indexOf("-webkit-gradient"),
            "autoprefixer should have -webkit-gradient in the minified output"
          ).to.be.above(-1);
        });
        fs.readFile(normalOuput, "utf8", function (err, contents) {
          if (err) {
            expect(err).to.be.null;
            return;
          }
          expect(
            contents.indexOf("-webkit-gradient"),
            "autoprefixer should have -webkit-gradient in the normal unminified output"
          ).to.be.above(-1);
        });
        done();
      },
      (err) => {
        done(err);
      }
    );
  });
});

describe("Native Validate", () => {
  let localSass: string;

  before(function (done) {
    localSass = getLocalSass();
    if (!fs.existsSync(localSass)) {
      done(`${localSass} does not exist`);
    } else {
      done();
    }
  });

  it("directory value for sassBinPath should fail", (done) => {
    const native = new NativeCompiler();
    const config = new CompilerConfig();
    config.sassBinPath = localSass;
    native
      .validate(config, "")
      .then(
        (data) => {
          expect(false);
        },
        (err) => {
          expect(err).to.be.not.null;
        }
      )
      .finally(done);
  });

  it("non-existent Path for sassBinPath should fail", (done) => {
    const native = new NativeCompiler();
    const config = new CompilerConfig();
    config.sassBinPath = "/usr/local/bin/non-existent-binary";
    native
      .validate(config, "")
      .then(
        (data) => {
          expect(false);
        },
        (err) => {
          expect(err).to.be.not.null;
        }
      )
      .finally(done);
  });

  it("Valid Path for sassBinPath should succeed", (done) => {
    const native = new NativeCompiler();
    const config = new CompilerConfig();
    config.sassBinPath = localSass;
    native
      .validate(config, "")
      .then(
        (data) => {
          expect(data).to.be.not.null;
        },
        (err) => {
          expect(err).to.be.null;
        }
      )
      .finally(done);
  });
});
