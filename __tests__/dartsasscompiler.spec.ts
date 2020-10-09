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
import path from "path";
import fs from "fs";
import { getLocalSass } from "./testutil";

describe("DartsassCompiler SayVersion", () => {
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
    const compiler = new DartSassCompiler();
    const config = new CompilerConfig();
    config.sassBinPath = getLocalSass();
    const _log = getBufLog();
    compiler.sayVersion(config, "", _log).then(
      (data: string) => {
        expect(data).to.equal(
          "dart-sass\t1.27.0\t(Sass Compiler)\t[Dart]\ndart2js\t2.10.1\t(Dart Compiler)\t[Dart]"
        );
        done();
      },
      (err) => {
        done(err);
      }
    );
  });
});

describe("DartsassCompiler CompileDocument", () => {
  it("DartsassCompiler::compileDocument", (done) => {
    const compiler = new DartSassCompiler();
    const document: IDocument = getDocumentForFile("hello.scss");
    const config = new CompilerConfig();
    config.targetDirectory = "out";
    const _log = getNullLog();
    console.info(`Compiling ${document.getFileName()}`);
    expect(validateTargetDirectories(document, config)).to.be.null;
    const outputDirectory = path.join(__dirname, "out");
    compiler.compileDocument(document, config, _log).then(
      (result) => {
        expect(result).to.equal(path.join(outputDirectory, "hello.min.css"));
        fs.stat(path.join(outputDirectory, "hello.css.map"), (exists) => {
          expect(exists).to.be.null;
        });
        done();
      },
      (err) => {
        done(err);
      }
    );
  });
});
