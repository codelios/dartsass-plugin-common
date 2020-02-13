// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import 'mocha';
import { CleanCSSMinifier, getDefaultCleanCSSOptions } from '../src/cleancss';
import { expect } from 'chai';

describe('CleanCSSMinifier' , () => {

    it('minifySync', () => {
        const minifier = new CleanCSSMinifier(getDefaultCleanCSSOptions());
        const minifyOutput = minifier.minifySync(Buffer.from(`a { color: brown}`));
        expect(minifyOutput.output).to.be.not.null;
        expect(minifyOutput.output).to.be.not.undefined;
        expect(minifyOutput.output.length).to.be.greaterThan(0);
        expect(minifyOutput.sourceMap).to.be.not.null;
        expect(minifyOutput.sourceMap).to.be.not.undefined;
        expect(minifyOutput.sourceMap.length).to.be.greaterThan(0);
    });
});