// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import 'mocha';
import { getVersions } from '../src/autoprefix';
import { getBufLog } from './log';
import { expect } from 'chai';

describe('autoprefix' , () => {

    it('getVersions', () => {
        const versions = getVersions();
        const output = versions.join(",")
        expect(output).to.equal('PostCSS');
    });
});