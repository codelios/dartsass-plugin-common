// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import { expect } from 'chai';
import 'mocha';
import { inferTargetCSSDirectory, getOutputCSS, getOutputMinifiedCSS, getRelativeDirectory, doesContainSpaces, safeMkdir } from '../src/target';
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


describe('safeMkdir function', () => {

    it('Not Able to write root', () => {
        const result = safeMkdir("/newroot");
        expect(result).to.not.be.null;
    });
    it('Create normal directory', () => {
        const result = safeMkdir("/tmp/abc");
        expect(result).to.be.null;
    });
    it('Create normal directory - existing', () => {
      const repeatPath = "/tmp/abcrepeat";
      let result = safeMkdir(repeatPath);
      expect(result).to.be.null;
      result = safeMkdir(repeatPath);
      expect(result).to.be.null;
    });

});
describe('getOutputCSS function', () => {

    it('default', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "";
        const _log = getNullLog();
        const result = getOutputCSS(document, config, _log);
      expect(result).to.equal('/tmp/abc.css');
    });
});

describe('getOutputMinifiedCSS function', () => {

    it('default', () => {
        const document: IDocument = getSassDocument("/tmp", "/tmp/abc.scss", "abc");
        const config = new CompilerConfig();
        config.targetDirectory =  "";
        const _log = getNullLog();
        const result = getOutputMinifiedCSS(document, config, _log);
      expect(result).to.equal('/tmp/abc.min.css');
    });
});

describe('getRelativeDirectory function', () => {

  it('linux', () => {
      const result = getRelativeDirectory("/opt/code/src/github.com/heronci/sass-watcher/", "/opt/code/src/github.com/heronci/sass-watcher/src/sass");
      expect(result).to.equal('src/sass');
  });

  it('linux-relative', () => {
    const result = getRelativeDirectory("/opt/code/src/github.com/heronci/sass-watcher/", "src/sass");
    expect(result).to.equal('src/sass');
  });

});

describe('doesContainSpaces function', () => {

  it('no spaces', () => {
      const result = doesContainSpaces("/opt/code/src/github.com/heronci/sass-watcher/");
      expect(result).to.equal(false);
  });

  it('spaces', () => {
    const result = doesContainSpaces("/opt/code/src/github.com/heronci/sass watcher");
    expect(result).to.equal(true);
  });

});
