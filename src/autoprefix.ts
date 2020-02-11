// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';

import postcss = require('postcss');
import autoprefixer = require('autoprefixer');
import browserslist from 'browserslist';
import * as fs from 'fs';
import { CompilerConfig } from './config';
import { Info } from './version';
import { ILog } from './log';
import { writeToFile } from './writer';

export class Prefixer {

    processor: postcss.Processor | undefined;

    public static NewPrefixer(browsers: string | string[]| undefined) : Prefixer {
        const prefixer = new Prefixer();
        prefixer.processor = postcss().use(
            autoprefixer({
              browsers: browsers
            })
          );
        return prefixer;
    }

    public static NewDefaultPrefixer(): Prefixer {
        // See: https://github.com/browserslist/browserslist#readme
        // "There is a defaults query, which gives a reasonable configuration for most users:"
        return Prefixer.NewPrefixer("last 2 version");
    }

    public process(css: postcss.ParserInput | postcss.Result | postcss.LazyResult | postcss.Root): Promise<postcss.Result> {
        const self = this;
        return new Promise<postcss.Result>(function(resolve, reject) {
            if (self.processor !== undefined && self.processor !== null) {
                self.processor.process(css, {from:'', to: ''}).then(
                    value => resolve(value),
                    err => reject(err)
                )
            }
        });
    }
}


export function autoPrefixCSS(output: string, data: any,
    config : CompilerConfig,
    _log: ILog): Promise<number> {
    if (config.disableAutoPrefixer) {
        return writeToFile(output, data, _log);
    }
    const prefixer = Prefixer.NewPrefixer(config.autoPrefixBrowsersList);
    return new Promise<number>(function(resolve, reject) {
        prefixer.process(data).then(
            (prefixedResult: postcss.Result) => {
                writeToFile(output, prefixedResult.css,  _log).then(
                    value => resolve(value),
                    err => reject(err)
                )
            }
        )
    });
}


export function autoPrefixCSSFile(output: string, inFile: string,
    config : CompilerConfig,
    _log: ILog): Promise<number> {
    return new Promise<number>(function(resolve, reject) {
        if (config.disableAutoPrefixer) {
            resolve(0);
        }
        fs.readFile(inFile, 'utf8', function(err, contents) {
            if (err) {
                reject(err);
                return;
            }
            autoPrefixCSS(output, contents, config, _log).then(
                value => resolve(value),
                err => reject(err)
            );
        });
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
