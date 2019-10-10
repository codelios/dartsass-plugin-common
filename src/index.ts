// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import * as path from 'path';
import * as fs from 'fs';

import sass = require("sass");
import packageImporter = require('node-sass-package-importer');
import { IPackageImporterOptions } from 'node-sass-magic-importer/src/interfaces/IImporterOptions';
import { CompilerConfig } from './config';
import { xformPath, xformPaths} from './util';
import { IDocument } from './document';
import { ILog } from './log';
import { Prefixer } from './autoprefix';
import { getOutputCSS, getOutputMinifiedCSS} from './target';
import postcss = require('postcss');

export interface Info {
    info: string;
}

export interface CompilerResult {

    onSuccess(): void;

    onFailure(): void;
}

/**
 * Compile a given sass file based on DartSass implementation.
 *
 * More details of the API at -
 * https://github.com/sass/dart-sass/blob/master/README.md#javascript-api .
 */
export class DartSassCompiler {


    constructor() {
    }

    public compileAll(projectRoot: string, _log: ILog) : boolean {
        _log.error('Not yet implemented. To Compile All the sass files inside the given workspace');
        return false;
    }

    public sayVersion(_log: ILog) : string {
        const info = sass as unknown as Info;
        const version = info.info;
        return `${version}`;
    }

    public compileDocument(document: IDocument, dartsassConfig: CompilerConfig,
        compileSingleFile: boolean, _log: ILog) {
        this.compile(document, dartsassConfig, compileSingleFile, _log);
    }

    handleError(err: sass.SassException, config : CompilerConfig, compilerResult: CompilerResult,
            _log: ILog) {
        const fileonly = path.basename(err.file);
        const formattedMessage = ` ${err.line}:${err.column} ${err.formatted}`;
        _log.error(`${fileonly}: ${formattedMessage}`);
        _log.appendLine(`${err.formatted}`);
        compilerResult.onFailure();
    }

    writeSassOutput(output: string, data: any, compilerResult: CompilerResult, _log: ILog) {
        fs.writeFile(output, data, (err: NodeJS.ErrnoException | null) => {
            if (err !== null) {
                _log.error(`Error while writing the generated css file ${output}`);
                _log.appendLine(`${err} while writing ${output}`);
                compilerResult.onFailure();
                return;
            }
            compilerResult.onSuccess();
        });
    }

    writeFinalResult(output: string, data: any,
        config : CompilerConfig,
        prefixer: Prefixer,
        compilerResult: CompilerResult,
        _log: ILog) {
        const self = this;
        if (config.debug) {
            _log.appendLine("disableAutoPrefixer: " + config.disableAutoPrefixer);
        }
        if (!config.disableAutoPrefixer) {
            prefixer.process(data,
                function(prefixedResult: postcss.Result) {
                    self.writeSassOutput(output, prefixedResult.css, compilerResult, _log);
                }
                );
        } else {
            this.writeSassOutput(output, data, compilerResult, _log);
        }

    }

    compileToFileSync(document: IDocument, compressed: boolean, output: string,
        config : CompilerConfig,
        prefixer: Prefixer,
        compilerResult: CompilerResult,
        _log: ILog) {
        const sassWorkingDirectory  = xformPath(document.getProjectRoot(), config.sassWorkingDirectory);
        const includePaths = xformPaths(document.getProjectRoot(), config.includePath);
        const options = this.getOptions(sassWorkingDirectory);
        const result = sass.renderSync({
            file: document.getFileName(),
            importer: packageImporter(options),
            includePaths: includePaths,
            outputStyle: compressed ? 'compressed': 'expanded',
            outFile: output
        });
        if (result) {
            this.writeFinalResult(output, result.css, config, prefixer, compilerResult, _log);
        }

    }

    compileToFileAsync(document: IDocument, compressed: boolean, output: string,
        config : CompilerConfig,
        prefixer: Prefixer,
        compilerResult: CompilerResult,
        _log: ILog) {
        const sassWorkingDirectory  = xformPath(document.getProjectRoot(), config.sassWorkingDirectory);
        const includePaths = xformPaths(document.getProjectRoot(), config.includePath);
        const options = this.getOptions(sassWorkingDirectory);
        const self = this;
        sass.render({
            file: document.getFileName(),
            importer: packageImporter(options),
            includePaths: includePaths,
            outputStyle: compressed ? 'compressed': 'expanded',
            outFile: output
        }, function (err: sass.SassException, result: sass.Result) {
            if (err) {
                self.handleError(err, config, compilerResult, _log);
            } else {
                self.writeFinalResult(output, result.css, config, prefixer, compilerResult, _log);
            }
        });
    }

    compileToFile(document: IDocument, compressed: boolean, output: string,
        config : CompilerConfig,
        prefixer: Prefixer,
        compilerResult: CompilerResult,
        _log: ILog) {
        if (config.debug) {
            _log.appendLine("Sync compilation: " + config.sync);
        }
        if (config.sync) {
            this.compileToFileSync(document, compressed, output, config, prefixer, compilerResult, _log);
        } else {
            this.compileToFileAsync(document, compressed, output, config, prefixer, compilerResult, _log);
        }
    }

    getOptions(cwd: string) : IPackageImporterOptions {
        const options = {
            cwd: cwd,
            packageKeys: [
              'sass',
              'scss',
              'style',
              'css',
              'main.sass',
              'main.scss',
              'main.style',
              'main.css',
              'main'
            ],
            packagePrefix: '~'
          };
        return options;
    }

    public compile(document: IDocument,
        config : CompilerConfig,
        compileSingleFile: boolean, _log: ILog) {
        const input = document.getFileName();
        const fileonly = document.getFileOnly();
        if (fileonly.length === 0) {
            return;
        }
        const output = getOutputCSS( document.getFileName(), document.getFileOnly(), config);
        const compressedOutput = getOutputMinifiedCSS(document.getFileName(), document.getFileOnly(), config);
        const self = this;
        if (config.debug) {
            _log.appendLine("Scss working directory: " + config.sassWorkingDirectory);
            _log.appendLine("include path: " + config.includePath.join(","));
        }
        const prefixer = Prefixer.NewPrefixer(config.autoPrefixBrowsersList);
        const compilerResult:CompilerResult = {
            onFailure() {

            },
            onSuccess() {
                if (config.debug) {
                    _log.appendLine(`${input} -> ${output}`);
                }
                if (compileSingleFile) {
                    _log.info(`Compiled ${input} successfully`);
                }
                if (!config.disableMinifiedFileGeneration) {
                    const tmpResult :CompilerResult = {
                        onFailure() {

                        },
                        onSuccess() {
                            if (config.debug) {
                                _log.appendLine(`Min: ${input} -> ${compressedOutput}`);
                            }
                        }
                    };
                    self.compileToFile(document, true, compressedOutput, config, prefixer, tmpResult, _log);
                }
            }
        };
        this.compileToFile(document, false, output, config, prefixer, compilerResult, _log);
    }

}
