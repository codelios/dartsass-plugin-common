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

    minify(src: Buffer, inputSourceMap: Buffer | null, disableSourceMap: boolean): Promise<MinifyOutput>;

    minifySync(src: Buffer, inputSourceMap: Buffer | null, disableSourceMap: boolean): MinifyOutput;

}

