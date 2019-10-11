// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import { expect } from 'chai';
import 'mocha';
import { inferTargetCSSDirectory, inferTargetMinifiedCSSDirectory,getOutputCSS, getOutputMinifiedCSS, safeMkdir } from '../src/target';
import { IDocument } from '../src/document';
import { CompilerConfig } from '../src/config';
import { getSassDocument} from './document';
import { getNullLog } from './log';

describe('inferTargetCSSDirectory function', () => {

    it('inferTargetCSSDirectory for empty config', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "";
        const result = inferTargetCSSDirectory(document, config);
      expect(result).to.equal('/tmp');
    });

    it('inferTargetCSSDirectory for relative directory', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "out";
        const result = inferTargetCSSDirectory(document, config);
      expect(result).to.equal('/tmp/out');
    });

    it('inferTargetCSSDirectory for absolute directory', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "/tmp/test-absolute";
        const result = inferTargetCSSDirectory(document, config);
      expect(result).to.equal('/tmp/test-absolute');
    });

});


describe('inferTargetMinifiedCSSDirectory function', () => {

    it('inferTargetMinifiedCSSDirectory for empty target directory', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetMinifiedDirectory =  "";
        const result = inferTargetMinifiedCSSDirectory(document, config);
      expect(result).to.equal('/tmp');
    });

    it('inferTargetMinifiedCSSDirectory for relative directory', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetMinifiedDirectory =  "out";
      const result = inferTargetMinifiedCSSDirectory(document, config);
      expect(result).to.equal('/tmp/out');
    });

    it('inferTargetMinifiedCSSDirectory for absolute directory', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetMinifiedDirectory =  "/tmp/test-absolute";
      const result = inferTargetMinifiedCSSDirectory(document, config);
      expect(result).to.equal('/tmp/test-absolute');
    });

    it('inferTargetMinifiedCSSDirectory for empty targetDirectory and valid targetMinifiedDirectory', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "out";
      const result = inferTargetMinifiedCSSDirectory(document, config);
      expect(result).to.equal('/tmp/out');
    });
    it('inferTargetMinifiedCSSDirectory for non-empty targetMinifiedDirectory and non-empty targetDirectory', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "out";
        config.targetMinifiedDirectory = "min";
      const result = inferTargetMinifiedCSSDirectory(document, config);
      expect(result).to.equal('/tmp/min');
    });
    it('inferTargetMinifiedCSSDirectory for empty targetMinifiedDirectory and empty targetDirectory', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
      const result = inferTargetMinifiedCSSDirectory(document, config);
      expect(result).to.equal('/tmp');
    });

});
describe('safeMkdir function', () => {

    it('Not Able to write root', () => {
        const result = safeMkdir("/newroot");
        expect(result).to.not.be.null;
    });
    it('Create normal directory', () => {
        const result = safeMkdir("/tmp/abc");
        expect(result).to.be.null;
    });
});
describe('getOutputCSS function', () => {

    it('default', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetMinifiedDirectory =  "";
        const _log = getNullLog();
        const result = getOutputCSS(document, config, _log);
      expect(result).to.equal('/tmp/abc.css');
    });
});
describe('getOutputMinifiedCSS function', () => {

    it('default', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetMinifiedDirectory =  "";
        const _log = getNullLog();
        const result = getOutputMinifiedCSS(document, config, _log);
      expect(result).to.equal('/tmp/abc.min.css');
    });
});