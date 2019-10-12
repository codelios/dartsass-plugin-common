// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';


import postcss = require('postcss');
import autoprefixer = require('autoprefixer');

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
