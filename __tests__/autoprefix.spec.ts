// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import 'mocha';
import { CompilerConfig } from '../src/config';
import { CSSFile } from '../src/cssfile';
import { getVersions, doAutoprefixCSS } from '../src/autoprefix';
import { expect } from 'chai';

const InputCSS = `
.example {
    display: grid;
    transition: all .5s;
    user-select: none;
    background: linear-gradient(to bottom, white, black);
}
`;

describe('autoprefix' , () => {

    it('doAutoprefixCSS', (done) => {
        const config = new CompilerConfig();
        doAutoprefixCSS({
            css: Buffer.from(InputCSS),
            sourceMap: null,
        }, config).then(
            (value: CSSFile) => {
                expect(value.css).to.be.not.null;
                expect(value.sourceMap).to.be.not.null;
            },
            err => {
                expect(err).to.be.not.null;
            }
        ).finally(done);
    });

    it('getVersions', () => {
        const versions = getVersions();
        const output = versions.join(",")
        console.log(output);
        // expect(output).to.equal('PostCSS');
    });
});