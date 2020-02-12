// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
var CleanCSS = require('clean-css');


const Options = {

};

export class CleanCSSMinifier {



    constructor() {
    }

    public minify(src: Buffer): Promise<Buffer> {
        return new Promise<Buffer>(function(resolve, reject) {
            const data = new CleanCSS(Options).minify(src);
            const result = data.styles;
            resolve(result);
        });
    }
}