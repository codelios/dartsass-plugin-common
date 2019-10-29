// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import { expect } from 'chai';
import 'mocha';
import { CompilerConfig } from '../src/config';
import { getNullLog, getConsoleLog } from './log';
import { Watcher } from '../src/watcher';

var path = require('path');

describe('Watcher' , () => {

    it('watch compressed = false', (done) => {
        const watcher = new Watcher();
        const config = new CompilerConfig();
        config.targetDirectory = "out";
        config.sassBinPath = "/usr/local/bin/sass";
        const _log = getNullLog();
        const srcdir = path.join(__dirname, 'input');
        config.disableMinifiedFileGeneration = true;
        watcher.Watch(srcdir, __dirname, config, _log).then(
            (result) => {
                const watchList = watcher.GetWatchList();
                expect(watchList.size).to.be.equal(1);
                expect(watcher.Verify()).to.be.equal(0);
                expect(watcher.ClearWatch(srcdir, __dirname, _log)).to.be.true;
                expect(watchList.size).to.be.equal(0);
                expect(watcher.Verify()).to.be.equal(0);
            },
            err => {
                expect(err).to.be.null;
            }
        ).finally(done);
    });

    it('watch compressed = true', (done) => {
        const watcher = new Watcher();
        const config = new CompilerConfig();
        config.targetDirectory = "out";
        config.sassBinPath = "/usr/local/bin/sass";
        const _log = getNullLog();
        const srcdir = path.join(__dirname, 'input');
        watcher.Watch(srcdir, __dirname, config, _log).then(
            (result) => {
                const watchList = watcher.GetWatchList();
                expect(watchList.size).to.be.equal(1);
                expect(watcher.Verify()).to.be.equal(0);
                expect(watcher.ClearWatch(srcdir, __dirname, _log)).to.be.true;
                expect(watchList.size).to.be.equal(0);
                expect(watcher.Verify()).to.be.equal(0);
            },
            err => {
                expect(err).to.be.null;
            }
        ).finally(done);
    });

    it('relaunch', (done) => {
        const watcher = new Watcher();
        const config = new CompilerConfig();
        config.targetDirectory = "out";
        config.sassBinPath = "/usr/local/bin/sass";
        const _log = getConsoleLog();
        const srcdir = path.join(__dirname, 'input');
        watcher.Watch(srcdir, __dirname, config, _log).then(
            (result) => {
                let watchList = watcher.GetWatchList();
                expect(watchList.size).to.be.equal(1);
                expect(watcher.Verify()).to.be.equal(0);
                watcher.Relaunch(__dirname, config, _log);
            },
            err => {
                expect(err).to.be.null;
            }
        ).finally(done);
    });


});