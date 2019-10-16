// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';


export class CompilerConfig {

    sassBinPath: string = "";

    includePath: Array<string> = [];

    sassWorkingDirectory: string = "";

    disableMinifiedFileGeneration: boolean = false;

    disableSourceMap: boolean = false;

    debug: boolean = false;

    disableCompileOnSave: boolean = false;

    pauseInterval: number = 10;

    enableStartWithUnderscores: boolean = false;

    disableAutoPrefixer: boolean = false;

    autoPrefixBrowsersList: Array<string> = ["last 2 version"];

    targetDirectory: string = "";

    targetMinifiedDirectory: string = "";

}
