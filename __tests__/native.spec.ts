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

    it('sayVersion', () => {
        const native = new NativeCompiler();
        const config = new CompilerConfig();
        config.sassBinPath = "/usr/local/bin/sass";
        const _log = getBufLog();
        native.sayVersion(config, _log).then(
            function(data: any) {
                // This value comes from the version installed using Dockerfile. Hence hardcoded. YMMV locally.
                expect(data).to.equal('1.19.0 compiled with dart2js 2.2.0');
            },
            function(err: any) {
                expect(err).to.be.not.null;
            }
        );
    });
});

describe('Native CompileDocument' , () => {

    it('compileDocument correct', () => {
        const native = new NativeCompiler();
        const document: IDocument = getDocumentForFile('cmd.scss');
        const config = new CompilerConfig();
        config.targetDirectory = "out";
        config.sassBinPath = "/usr/local/bin/sass";
        const _log = getNullLog();
        native.compileDocument(document, config, _log).then(
            result => {
                const output = path.join(document.getProjectRoot(), 'out/cmd.min.css');
                expect(result).to.equal(output);
            },
            err => {
                expect(err).to.be.null;
            }
        )
    });

    it('compileDocument incorrect scss should result in error', () => {
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
        )
    });

    it('compileDocument autoprefix', () => {
        const native = new NativeCompiler();
        const document: IDocument = getDocumentForFile('autoprefixer_example.scss');
        const config = new CompilerConfig();
        config.targetDirectory = "out";
        config.sassBinPath = "/usr/local/bin/sass";
        config.autoPrefixBrowsersList = ["last 2 version"];
        const _log = getNullLog();
        native.compileDocument(document, config, _log).then(
            result => {
                const output = path.join(document.getProjectRoot(), 'out/autoprefixer_example.min.css');
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
        )
    });


});

describe('Native Which' , () => {

    it('which', () => {
        const native = new NativeCompiler();
        const config = new CompilerConfig();
        config.sassBinPath = "/usr/local/bin/sass";
        const _log = getNullLog();
        native.which(config, _log).then(
            data => {
                expect(data).to.equal(config.sassBinPath);
            },
            err => {
                expect(err).to.be.null;
            }
        )

    });
});

describe('Native Validate' , () => {

    it('directory for sassBinPath should fail', () => {
        const native = new NativeCompiler();
        const config = new CompilerConfig();
        config.sassBinPath = "/usr/local/bin";
        native.validate(config).then(
            data => {
                expect(false);
            },
            err => {
                expect(err).to.be.not.null;
            }
        )

    });

    it('non-existent Path for sassBinPath should fail', () => {
        const native = new NativeCompiler();
        const config = new CompilerConfig();
        config.sassBinPath = "/usr/local/bin/non-existent-binary";
        native.validate(config).then(
            data => {
                expect(false);
            },
            err => {
                expect(err).to.be.not.null;
            }
        )

    });

    it('Valid Path for sassBinPath should succeed', () => {
        const native = new NativeCompiler();
        const config = new CompilerConfig();
        config.sassBinPath = "/usr/local/bin/sass";
        native.validate(config).then(
            data => {
                expect(data).to.be.not.null;
            },
            err => {
                expect(err).to.be.null;
            }
        )

    });
});