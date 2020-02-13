// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import 'mocha';
import { CleanCSSMinifier } from '../src/cleancss';
import { expect } from 'chai';

describe('CleanCSSMinifier' , () => {

    it('minifySync', () => {
        const minifier = new CleanCSSMinifier();
        const minifyOutput = minifier.minifySync(Buffer.from(`a { color: brown; }`), false);
        var should = require('chai').should();
        should.exist(minifyOutput.output)
        expect(minifyOutput.output.length).to.be.greaterThan(0);
        should.exist(minifyOutput.sourceMap);
        // expect(minifyOutput.sourceMap.length).to.be.greaterThan(0);
    });
});