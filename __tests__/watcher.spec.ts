'use strict';
import { expect } from 'chai';
import 'mocha';
import { NativeCompiler } from '../src/native';
import { CompilerConfig } from '../src/config';
import { getNullLog } from './log';
import { Watcher } from '../src/watcher';

var path = require('path');

describe('Watcher' , () => {

    it('watch correct', (done) => {
        const watcher = new Watcher();
        const native = new NativeCompiler();
        const config = new CompilerConfig();
        config.targetDirectory = "out";
        config.sassBinPath = "/usr/local/bin/sass";
        const _log = getNullLog();
        const srcdir = path.join(__dirname, 'input');
        watcher.Watch(native, srcdir, __dirname, config, _log).then(
            (result) => {
                const watchList = watcher.GetWatchList();
                expect(watchList.size).to.be.equal(1);
                console.log(watchList);
                watcher.ClearWatch(srcdir, __dirname);
                expect(watchList.size).to.be.equal(0);
            },
            err => {
                expect(err).to.be.null;
            }
        ).finally(done);
    });


});