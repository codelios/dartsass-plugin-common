// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import 'mocha';
import { libVersions } from '../src/autoprefix';
import { getNullLog } from './log';

describe('libVersions' , () => {

    it('libVersions', () => {
        const _log = getNullLog();
        libVersions(_log);
    });
});