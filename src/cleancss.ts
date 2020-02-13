// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { MinifyOutput } from './minifier';

var CleanCSS = require('clean-css');



export class CleanCSSMinifier {


    constructor() {
    }

    public minify(src: Buffer, disableSourceMap: boolean): Promise<MinifyOutput> {
        const self = this;
        return new Promise<MinifyOutput>(function(resolve, reject) {
            resolve(self.minifySync(src, disableSourceMap));
        });
    }

    public minifySync(src: Buffer, disableSourceMap: boolean): MinifyOutput {
        const data = new CleanCSS({
            sourceMap: !disableSourceMap
        }).minify(src);
        return  {
            output: data.styles,
            sourceMap: data.sourceMap
        };
    }
}