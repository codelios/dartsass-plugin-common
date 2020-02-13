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
import { CSSFile } from './cssfile'
import { doTransformBytes } from './transform';
import { readFileSync } from 'fs';


export function doAutoprefixCSS(cssfile: CSSFile, config : CompilerConfig): Promise<CSSFile> {
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
        processor.process(cssfile.output, {from:'', to: ''}).then(
            (value: postcss.Result) => resolve({
                output: Buffer.from(value.css),
                sourceMap: value.map
            }),
            err => reject(err)
        )
    });
}

export function autoPrefixCSSFile(output: string, inFile: string,
    config : CompilerConfig,
    _log: ILog): Promise<number> {
    const data = readFileSync(inFile);
    _log.debug(`About to autoprefix file ${inFile} to ${output}`);
    return autoPrefixCSSBytes(output, {
        output: data,
        sourceMap: null,
    }, config, _log);
}

export function autoPrefixCSSBytes(output: string, inFile: CSSFile,
    config : CompilerConfig,
    _log: ILog): Promise<number> {
    return doTransformBytes(inFile, output, _log,
        (contents: CSSFile) => {
            return doAutoprefixCSS(contents, config);
        }
        );
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
