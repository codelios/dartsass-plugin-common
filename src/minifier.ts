// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT


'use strict';
import { ILog } from './log';

export interface IMinifier {

    minify(src: string, encoding: string, target: string, _log: ILog): Promise<number>;

}

