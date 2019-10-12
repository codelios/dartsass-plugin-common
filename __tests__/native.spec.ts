// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import { expect } from 'chai';
import 'mocha';
import { NativeCompiler } from '../src/native';
import { IDocument } from '../src/document';
import { CompilerConfig } from '../src/config';
import { getDocumentForFile} from './document';
import { getNullLog, getBufLog } from './log';

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

    it('compileDocument', () => {
        const native = new NativeCompiler();
        const document: IDocument = getDocumentForFile('cmd.scss');
        const config = new CompilerConfig();
        config.targetDirectory = "out";
        config.sassBinPath = "/usr/local/bin/sass";
        const _log = getNullLog();
        native.compileDocument(document, config, _log).then(
            result => {
                expect(result).to.equal('Hello');
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