// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
'use strict';
import * as path from 'path';
import { CompilerConfig } from './config';
import { xformPath } from './util';
import { ILog } from './log';
import { IDocument } from './document';
const mkdirp = require("mkdirp");

function safeMkdir(directory: string): any {
    return mkdirp.sync(directory);
}

export function getOutputCSS(document: IDocument, config : CompilerConfig, _log: ILog): string {
    const fileonly = document.getFileOnly();
    let targetDirectory = path.dirname(document.getFileName());
    if (config.targetDirectory.length > 0) {
        const projectRoot = document.getProjectRoot();
        targetDirectory = xformPath(projectRoot, config.targetDirectory);
        const err = safeMkdir(targetDirectory);
        if (err) {
            _log.error(err);
        } else {
            return path.join(targetDirectory, fileonly + '.css');
        }
    }
    return path.join(targetDirectory, fileonly + '.css');
}

export function getOutputMinifiedCSS(document: IDocument, config: CompilerConfig, _log: ILog): string {
    const fileonly = document.getFileOnly();
    let targetMinifiedDirectory = path.dirname(document.getFileName());
    if (config.targetMinifiedDirectory.length == 0 && config.targetDirectory.length > 0) {
        const projectRoot = document.getProjectRoot();
        targetMinifiedDirectory = xformPath(projectRoot, config.targetDirectory);
        const err = safeMkdir(targetMinifiedDirectory);
        if (err) {
            _log.error(err);
        }
    } else if (config.targetMinifiedDirectory.length > 0) {
        const projectRoot = document.getProjectRoot();
        targetMinifiedDirectory = xformPath(projectRoot, config.targetMinifiedDirectory);
        const err = safeMkdir(targetMinifiedDirectory);
        if (err) {
            _log.error(err);
        }
    }
    return path.join(targetMinifiedDirectory, fileonly + '.min.css');
}
