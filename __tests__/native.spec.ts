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
import { getSassDocument} from './document';
import { getNullLog } from './log';

describe('Native SayVersion' , () => {

    it('sayVersion', () => {
        const native = new NativeCompiler();
        const config = new CompilerConfig();
        config.sassBinPath = "/usr/local/bin/sass";
        const _log = getNullLog();
        const result = native.sayVersion(config, _log);
      expect(result).to.equal('/tmp/abc.css');
    });
});

describe('Native CompileDocument' , () => {

    it('sayVersion', () => {
        const native = new NativeCompiler();
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.sassBinPath = "/usr/local/bin/sass";
        const _log = getNullLog();
        native.compileDocument(document, config, true,_log);
    });
});