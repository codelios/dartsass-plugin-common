// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';

import postcss = require('postcss');
import autoprefixer = require('autoprefixer');
import browserslist from 'browserslist';
import { CompilerConfig } from './config';
import { Info } from './version';
import { ILog } from './log';
import { CSSFile, writeCSSFile } from './cssfile'


export function doAutoprefixCSS(cssfile: CSSFile, config : CompilerConfig, _log: ILog): Promise<CSSFile> {
    return new Promise<CSSFile>(function(resolve, reject) {
        if (config.disableAutoPrefixer) {
            resolve(cssfile);
            return;
        }
        const processor = postcss().use(
            autoprefixer({
              browsers: config.autoPrefixBrowsersList
            })
          );
        processor.process(cssfile.css.toString(), {
            from: '',
            to: ''
        }).then(
            (result: postcss.Result) => {
                result.warnings().forEach(warn => {
                    _log.appendLine(`Warning: Autoprefixer: ${warn}`);
                });
                resolve({
                    css: Buffer.from(result.css),
                    sourceMap: cssfile.sourceMap
                });
            },
            err => {
                reject(err);
            }
        )
    });
}

export function autoPrefixCSSBytes(output: string, inFile: CSSFile,
    config : CompilerConfig,
    _log: ILog): Promise<number> {
    return new Promise<number>( function(resolve, reject){
        doAutoprefixCSS(inFile, config, _log).then(
            (value: CSSFile) => {
                writeCSSFile(value, output, _log).then(
                    (value: number) => resolve(value),
                    err => reject(err)
                )
            },
            err => reject(err)
        );
    });
}


export function getVersions(): Array<string> {
    const result = new Array<string>();

    const postcssInfo = postcss as unknown as Info;
    result.push(`PostCSS: ${postcssInfo.info}`);

    const autoprefixerInfo = autoprefixer as unknown as Info;
    result.push(`autoprefixer: ${autoprefixerInfo.info}`);

    const browserslistInfo = browserslist as unknown as Info;
    result.push(`browserslist: ${browserslistInfo.info}`);

    return result;
}
