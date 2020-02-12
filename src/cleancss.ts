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
        const self = this;
        return new Promise<Buffer>(function(resolve, reject) {
            resolve(self.minifySync(src));
        });
    }

    public minifySync(src: Buffer): Buffer {
            const data = new CleanCSS(Options).minify(src);
            return data.styles;
    }
}