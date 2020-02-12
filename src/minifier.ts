// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';

export interface IMinifier {

    minify(src: Buffer): Promise<Buffer>;

    minifySync(src: Buffer): Buffer;

}

