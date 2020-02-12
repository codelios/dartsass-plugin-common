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
import { doTransform, doTransformBytes } from './transform';


function doAutoprefixCSS(config : CompilerConfig, data: string): Promise<string> {
    return new Promise<string>(function(resolve, reject) {
        if (config.disableAutoPrefixer) {
            resolve(data);
            return;
        }
        const processor = postcss().use(
            autoprefixer({
              browsers: config.autoPrefixBrowsersList
            })
          );
        processor.process(data, {from:'', to: ''}).then(
            (value: postcss.Result) => resolve(value.css),
            err => reject(err)
        )
    });
}

export function autoPrefixCSSFile(output: string, inFile: string,
    config : CompilerConfig,
    _log: ILog): Promise<number> {
    _log.debug(`About to autoprefix file ${inFile} to ${output}`);
    return doTransform(inFile, config.encoding, output, _log,
        (contents: string) => {
            return doAutoprefixCSS(config, contents);
        }
        );
}

export function autoPrefixCSSBytes(output: string, inBytes: string,
    config : CompilerConfig,
    _log: ILog): Promise<number> {
    _log.debug(`About to autoprefix bytes to ${output}`);
    return doTransformBytes(inBytes, output, _log,
        (contents: string) => {
            return doAutoprefixCSS(config, contents);
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
