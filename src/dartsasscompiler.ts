// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import * as path from 'path';

import sass = require("sass");
import { CompilerConfig } from './config';
import { xformPaths} from './util';
import { IDocument } from './document';
import { ILog } from './log';
import { getOutputCSS, getOutputMinifiedCSS} from './target';
import { writeToFile } from './transform';
import { autoPrefixCSSBytes } from './autoprefix';
import { ProcessOutput } from './run';
import { Info } from './version';

const NativeSassMessage = `
    The watcher functionality needs native sass binary to be installed in your machine.
    Installation Cmd: npm install sass@1.25.0 (say).
    After installation, please set "dartsass.sassBinPath": "node_modules/.bin/sass" (Linux) or
    "dartsass.sassBinPath": "node_modules/.bin/sass.cmd"     (Windows) after installation for watcher to work.
`;

/**
 * Compile a given sass file based on DartSass implementation.
 *
 * More details of the API at -
 * https://github.com/sass/dart-sass/blob/master/README.md#javascript-api .
 */
export class DartSassCompiler {


    constructor() {
    }

    public validate(config: CompilerConfig, projectRoot: string): Promise<string> {
        return new Promise(function(resolve, reject) {
            resolve('');
        });
    }

    public sayVersion(config: CompilerConfig, projectRoot: string, _log: ILog): Promise<string> {
        const info = sass as unknown as Info;
        const version = info.info;
        return new Promise(function(resolve, _) {
            resolve(`${version}`);
        });
    }

    public compileDocument(document: IDocument, config: CompilerConfig,_log: ILog): Promise<string> {
        const input = document.getFileName();
        const output = getOutputCSS( document, config, _log);
        const compressedOutput = getOutputMinifiedCSS(document, config, _log);
        if (config.debug) {
            _log.appendLine("include path: " + config.includePath.join(","));
        }
        _log.appendLine(`${input} -> ${output}`);
        const self = this;
        return new Promise<string>(function(resolve, reject) {
            self.asyncCompile(document, false, output, config, _log).then(
                value => {
                    if (!config.disableMinifiedFileGeneration) {
                        self.asyncCompile(document, true, compressedOutput, config,  _log).then(
                            value => resolve(value),
                            err => reject(err)
                        )
                    }
                },
                err => reject(err)
            )
        });
    }

    public watch(srcdir: string, projectRoot: string, config: CompilerConfig, _log: ILog) : Promise<ProcessOutput> {
        return new Promise<ProcessOutput>(function(resolve, reject) {
            reject(`${NativeSassMessage}`);
        });
    }

    handleError(err: sass.SassException, config : CompilerConfig, _log: ILog): string {
        const fileonly = path.basename(err.file);
        const formattedMessage = ` ${err.line}:${err.column} ${err.formatted}`;
        _log.appendLine(`Warning: ${err.formatted}`);
        return `${fileonly}: ${formattedMessage}`;
    }

    asyncCompile(document: IDocument, compressed: boolean, output: string,
        config : CompilerConfig,
        _log: ILog): Promise<string> {
        const includePaths = xformPaths(document.getProjectRoot(), config.includePath);
        _log.debug(`asyncCompile (compileOnSave) IncludePaths: ${includePaths}`);
        const self = this;
        return new Promise<string>(function(resolve, reject) {
            sass.render({
                file: document.getFileName(),
                includePaths: includePaths,
                outputStyle: compressed ? 'compressed': 'expanded',
                outFile: output,
                sourceMap: !config.disableSourceMap
            }, function (err: sass.SassException, result: sass.Result) {
                if (err) {
                    const msg = self.handleError(err, config, _log);
                    reject(`${msg}`);
                } else {
                    _log.debug(`asyncCompile(compileOnSave) over. Starting autoprefix`);
                    autoPrefixCSSBytes(output, result.css.toString(config.encoding), config,  _log).then(
                        value => resolve(output),
                        err => reject(err)
                    )
                    if (!config.disableSourceMap && !(result.map === null || result.map === undefined)) {
                        writeToFile(output+'.map', result.map, _log).then(
                            value => {},
                            err => reject(err)
                        );
                    }
                }
            });
        });
    }


}
