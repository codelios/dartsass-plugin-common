// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { CSSFile } from './cssfile';

var CleanCSS = require('clean-css');



export class CleanCSSMinifier {


    constructor() {
    }

    public minify(src: CSSFile, disableSourceMap: boolean): Promise<CSSFile> {
        const self = this;
        return new Promise<CSSFile>(function(resolve, reject) {
            resolve(self.minifySync(src, disableSourceMap));
        });
    }

    public minifySync(src: CSSFile, disableSourceMap: boolean): CSSFile {
        const data = new CleanCSS({
            sourceMap: !disableSourceMap
        }).minify(src.css, src.sourceMap);
        return  {
            css: data.styles,
            sourceMap: data.sourceMap
        };
    }
}