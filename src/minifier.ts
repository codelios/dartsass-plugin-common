// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';

export interface MinifyOutput {

    output: Buffer;

    sourceMap: Buffer;
}

export interface IMinifier {

    minify(src: Buffer, disableSourceMap: boolean): Promise<MinifyOutput>;

    minifySync(src: Buffer, disableSourceMap: boolean): MinifyOutput;

}

