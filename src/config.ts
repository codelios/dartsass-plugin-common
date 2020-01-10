// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';


export class CompilerConfig {

    sassBinPath: string = "";

    includePath: Array<string> = [];

    disableMinifiedFileGeneration: boolean = false;

    disableSourceMap: boolean = false;

    debug: boolean = false;

    disableCompileOnSave: boolean = false;

    pauseInterval: number = 10;

    enableStartWithUnderscores: boolean = false;

    disableAutoPrefixer: boolean = false;

    autoPrefixBrowsersList: Array<string> = ["> 1%", "last 2 versions"];

    targetDirectory: string = "";

    targetMinifiedDirectory: string = "";

    watchDirectories: Array<string> = [];
}
