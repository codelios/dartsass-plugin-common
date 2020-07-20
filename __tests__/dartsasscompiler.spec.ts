// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";
import { expect } from "chai";
import "mocha";
import { DartSassCompiler } from "../src/dartsasscompiler";
import { IDocument } from "../src/document";
import { CompilerConfig } from "../src/config";
import { validateTargetDirectories } from "../src/target";
import { getDocumentForFile } from "./document";
import { getNullLog, getBufLog } from "./log";
const path = require("path");
import fs from "fs";

describe("DartsassCompiler SayVersion", () => {
  it("sayVersion", (done) => {
    const compiler = new DartSassCompiler();
    const config = new CompilerConfig();
    config.sassBinPath = "/usr/local/bin/sass";
    const _log = getBufLog();
    compiler
      .sayVersion(config, "", _log)
      .then(
        function (data: any) {
          // This value comes from the version installed using Dockerfile. Hence hardcoded. YMMV locally.
          expect(data).to.equal(
            "dart-sass\t1.26.3\t(Sass Compiler)\t[Dart]\ndart2js\t2.7.1\t(Dart Compiler)\t[Dart]"
          );
        },
        function (err: any) {
          expect(err).to.be.not.null;
        }
      )
      .finally(done);
  });
});

describe("DartsassCompiler CompileDocument", () => {
  it("DartsassCompiler::compileDocument", (done) => {
    const compiler = new DartSassCompiler();
    const document: IDocument = getDocumentForFile("hello.scss");
    const config = new CompilerConfig();
    config.targetDirectory = "out";
    const _log = getNullLog();
    expect(validateTargetDirectories(document, config)).to.be.null;
    const outputDirectory = path.join(__dirname, "out");
    compiler
      .compileDocument(document, config, _log)
      .then(
        (result) => {
          expect(result).to.equal(path.join(outputDirectory, "hello.min.css"));
          fs.stat(path.join(outputDirectory, "hello.css.map"), (exists) => {
            expect(exists).to.be.null;
          });
        },
        (err) => {
          expect(err).to.be.null;
        }
      )
      .finally(done);
  });
});
