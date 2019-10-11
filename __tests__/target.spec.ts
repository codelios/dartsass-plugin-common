// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import { expect } from 'chai';
import 'mocha';
import { getOutputCSS } from '../src/target';
import { IDocument } from '../src/document';
import { CompilerConfig } from '../src/config';
import { getNullLog } from './log';

describe('getOutputCSS function', () => {

    it('getOutputCSS for empty config', () => {
        const document: IDocument = {
            isSass(): boolean {
                return true;
            },
            getFileName(): string {
                return "/tmp/abc.scss";
            },
            getFileOnly(): string {
                return "abc";
            },
            getProjectRoot() {
                return "/tmp";
            },
        };
        const config = new CompilerConfig();
        config.targetDirectory =  "";
        const _log = getNullLog();
      const result = getOutputCSS(document, config, _log);
      expect(result).to.equal('/tmp/abc.css');
    });

    it('getOutputCSS for relative directory', () => {
        const document: IDocument = {
            isSass(): boolean {
                return true;
            },
            getFileName(): string {
                return "/tmp/abc.scss";
            },
            getFileOnly(): string {
                return "abc";
            },
            getProjectRoot() {
                return "/tmp";
            },
        };
        const config = new CompilerConfig();
        config.targetDirectory =  "out";
        const _log = getNullLog();
      const result = getOutputCSS(document, config, _log);
      expect(result).to.equal('/tmp/out/abc.css');
    });

    it('getOutputCSS for absolute directory', () => {
        const document: IDocument = {
            isSass(): boolean {
                return true;
            },
            getFileName(): string {
                return "/tmp/abc.scss";
            },
            getFileOnly(): string {
                return "abc";
            },
            getProjectRoot() {
                return "/tmp";
            },
        };
        const config = new CompilerConfig();
        config.targetDirectory =  "/home/akkumar/Desktop/unittest-dartsass";
        const _log = getNullLog();
      const result = getOutputCSS(document, config, _log);
      expect(result).to.equal('/home/akkumar/Desktop/unittest-dartsass/abc.css');
    });

});
