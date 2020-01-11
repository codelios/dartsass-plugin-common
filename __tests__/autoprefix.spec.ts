// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import 'mocha';
import { libVersions } from '../src/autoprefix';
import { getBufLog } from './log';
import { expect } from 'chai';

describe('libVersions' , () => {

    it('libVersions', () => {
        const _log = getBufLog();
        libVersions(_log);
        const output = _log.getInfo();
        expect(output).to.equal('PostCSS');
    });
});