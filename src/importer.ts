// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';

import { IPackageImporterOptions } from 'node-sass-magic-importer/src/interfaces/IImporterOptions';
import packageImporter = require('node-sass-package-importer');

export function getOptions(cwd: string) : IPackageImporterOptions {
    const options = {
        cwd: cwd,
        packageKeys: [
          'sass',
          'scss',
          'style',
          'css',
          'main.sass',
          'main.scss',
          'main.style',
          'main.css',
          'main'
        ],
        packagePrefix: '~'
      };
    return options;
}

export function getImporter(cwd: string) : (url: string) => { contents: string; file?: undefined; } | { file: string; contents?: undefined; } | null {
    return packageImporter(getOptions(cwd));
}
