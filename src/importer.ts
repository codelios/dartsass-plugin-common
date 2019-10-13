// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';

import { IPackageImporterOptions } from 'node-sass-magic-importer/src/interfaces/IImporterOptions';
import packageImporter = require('node-sass-package-importer');
import sass = require("sass");

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

export function getImporter(cwd: string) : sass.Importer {
    return packageImporter(getOptions(cwd));
}
