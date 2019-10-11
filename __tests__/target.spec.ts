// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import { expect } from 'chai';
import 'mocha';
import { getOutputCSS, getOutputMinifiedCSS } from '../src/target';
import { IDocument } from '../src/document';
import { CompilerConfig } from '../src/config';
import { getNullLog } from './log';
import { getSassDocument} from './document';

describe('getOutputCSS function', () => {

    it('getOutputCSS for empty config', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "";
        const _log = getNullLog();
      const result = getOutputCSS(document, config, _log);
      expect(result).to.equal('/tmp/abc.css');
    });

    it('getOutputCSS for relative directory', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "out";
        const _log = getNullLog();
      const result = getOutputCSS(document, config, _log);
      expect(result).to.equal('/tmp/out/abc.css');
    });

    it('getOutputCSS for absolute directory', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "/home/akkumar/Desktop/unittest-dartsass";
        const _log = getNullLog();
      const result = getOutputCSS(document, config, _log);
      expect(result).to.equal('/home/akkumar/Desktop/unittest-dartsass/abc.css');
    });

});


describe('getOutputMinifiedCSS function', () => {

    it('getOutputMinifiedCSS for empty config', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "";
        const _log = getNullLog();
      const result = getOutputMinifiedCSS(document, config, _log);
      expect(result).to.equal('/tmp/abc.min.css');
    });

    it('getOutputMinifiedCSS for relative directory', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "out";
        const _log = getNullLog();
      const result = getOutputMinifiedCSS(document, config, _log);
      expect(result).to.equal('/tmp/out/abc.min.css');
    });

    it('getOutputMinifiedCSS for absolute directory', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "/home/akkumar/Desktop/unittest-dartsass";
        const _log = getNullLog();
      const result = getOutputMinifiedCSS(document, config, _log);
      expect(result).to.equal('/home/akkumar/Desktop/unittest-dartsass/abc.min.css');
    });

});