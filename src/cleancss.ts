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

    public minify(src: CSSFile, disableSourceMap: boolean, comment: Buffer): Promise<CSSFile> {
        const self = this;
        return new Promise<CSSFile>(function(resolve, reject) {
            resolve(self.minifySync(src, disableSourceMap, comment));
        });
    }

    public minifySync(src: CSSFile, disableSourceMap: boolean, comment: Buffer): CSSFile {
        const cleancss = new CleanCSS({
            sourceMap: !disableSourceMap
        });
        let data = null;
        if (src.sourceMap !== undefined && src.sourceMap !== null) {
            data = cleancss.minify(src.css, src.sourceMap);
        } else {
            data = cleancss.minify(src.css);
        }
        return  {
            css: data.styles + comment,
            sourceMap:  (!disableSourceMap ? data.sourceMap : undefined),
        };
    }
}