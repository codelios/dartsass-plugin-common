// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import { expect } from 'chai';
import 'mocha';
import * as fs from 'fs';
import { NativeCompiler } from '../src/native';
import { IDocument } from '../src/document';
import { CompilerConfig } from '../src/config';
import { getDocumentForFile} from './document';
import { getNullLog, getBufLog } from './log';
var path = require('path');

describe('Native SayVersion' , () => {

    it('sayVersion', (done) => {
        const native = new NativeCompiler();
        const config = new CompilerConfig();
        config.sassBinPath = "/usr/local/bin/sass";
        const _log = getBufLog();
        native.sayVersion(config, "", _log).then(
            function(data: any) {
                // This value comes from the version installed using Dockerfile. Hence hardcoded. YMMV locally.
                expect(data).to.equal('1.19.0 compiled with dart2js 2.2.0');
            },
            function(err: any) {
                expect(err).to.be.not.null;
            }
        ).finally(done);
    })
});

describe('Native CompileDocument' , () => {

    it('compileDocument correct', (done) => {
        const native = new NativeCompiler();
        const document: IDocument = getDocumentForFile('cmd.scss');
        const config = new CompilerConfig();
        config.targetDirectory = "out";
        config.sassBinPath = "/usr/local/bin/sass";
        config.disableMinifiedFileGeneration = true;
        const _log = getNullLog();
        native.compileDocument(document, config, _log).then(
            result => {
                const output = path.join(document.getProjectRoot(), 'out/cmd.css');
                expect(result).to.equal(output);
            },
            err => {
                expect(err).to.be.null;
            }
        ).finally(done);
    });

    it('compileDocument invalid/nonexistent/incorrect scss should result in error', (done) => {
        const native = new NativeCompiler();
        const document: IDocument = getDocumentForFile('invalid.scss');
        const config = new CompilerConfig();
        config.targetDirectory = "out";
        config.sassBinPath = "/usr/local/bin/sass";
        const _log = getNullLog();
        native.compileDocument(document, config, _log).then(
            result => {
                expect(result).to.be.null;
            },
            err => {
                expect(err).to.be.not.null;
            }
        ).finally(done);
    });

    it('compileDocument autoprefix', (done) => {
        const native = new NativeCompiler();
        const document: IDocument = getDocumentForFile('autoprefixer_example.scss');
        const config = new CompilerConfig();
        config.targetDirectory = "out";
        config.sassBinPath = "/usr/local/bin/sass";
        config.autoPrefixBrowsersList = ["last 2 version"];
        config.disableMinifiedFileGeneration = true;
        const _log = getNullLog();
        native.compileDocument(document, config, _log).then(
            result => {
                const output = path.join(document.getProjectRoot(), 'out/autoprefixer_example.css');
                const normalOuput = path.join(document.getProjectRoot(), 'out/autoprefixer_example.css');
                expect(result).to.equal(output);
                fs.readFile(output, 'utf8', function(err, contents) {
                    if (err) {
                        expect(err).to.be.null;
                        return;
                    }
                    expect(contents.indexOf('-webkit-gradient'),
                      "autoprefixer should have -webkit-gradient in the minified output").
                      to.be.above(-1);
                });
                fs.readFile(normalOuput, 'utf8', function(err, contents) {
                    if (err) {
                        expect(err).to.be.null;
                        return;
                    }
                    expect(contents.indexOf('-webkit-gradient'),
                      "autoprefixer should have -webkit-gradient in the normal unminified output").
                      to.be.above(-1);
                });
            },
            err => {
                expect(err).to.be.null;
            }
        ).finally(done);
    });


});

describe('Native Validate' , () => {

    it('directory value for sassBinPath should fail', (done) => {
        const native = new NativeCompiler();
        const config = new CompilerConfig();
        config.sassBinPath = "/usr/local/bin";
        native.validate(config, "").then(
            data => {
                expect(false);
            },
            err => {
                expect(err).to.be.not.null;
            }
        ).finally(done);

    });

    it('non-existent Path for sassBinPath should fail', (done) => {
        const native = new NativeCompiler();
        const config = new CompilerConfig();
        config.sassBinPath = "/usr/local/bin/non-existent-binary";
        native.validate(config, "").then(
            data => {
                expect(false);
            },
            err => {
                expect(err).to.be.not.null;
            }
        ).finally(done);

    });

    it('Valid Path for sassBinPath should succeed', (done) => {
        const native = new NativeCompiler();
        const config = new CompilerConfig();
        config.sassBinPath = "/usr/local/bin/sass";
        native.validate(config, "").then(
            data => {
                expect(data).to.be.not.null;
            },
            err => {
                expect(err).to.be.null;
            }
        ).finally(done);

    });
});
