// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';

import { CSSFile } from './cssfile';

export interface IMinifier {

    minify(src: CSSFile, disableSourceMap: boolean): Promise<CSSFile>;

    minifySync(src: CSSFile, disableSourceMap: boolean): CSSFile;

}

export function removeStdIn(inputMap: any): any {
    if (inputMap.hasOwnProperty("sources")) {
        delete inputMap.sources["$stdin"];
    }
    return inputMap;
}