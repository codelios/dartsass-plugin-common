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

export function inferTargetCSSDirectory(document: IDocument, config: CompilerConfig): string {
    let targetDirectory = path.dirname(document.getFileName());
    if (config.targetDirectory.length > 0) {
        const projectRoot = document.getProjectRoot();
        targetDirectory = xformPath(projectRoot, config.targetDirectory);
    }
    return targetDirectory;
}

export function inferTargetMinifiedCSSDirectory(document: IDocument, config: CompilerConfig): string {
    let targetMinifiedDirectory = path.dirname(document.getFileName());
    if (config.targetMinifiedDirectory.length == 0 && config.targetDirectory.length > 0) {
        const projectRoot = document.getProjectRoot();
        targetMinifiedDirectory = xformPath(projectRoot, config.targetDirectory);
    } else if (config.targetMinifiedDirectory.length > 0) {
        const projectRoot = document.getProjectRoot();
        targetMinifiedDirectory = xformPath(projectRoot, config.targetMinifiedDirectory);
    }
    return targetMinifiedDirectory;
}


export function safeMkdir(directory: string): any {
    try {
        mkdirp.sync(directory);
        return null;
    } catch (err) {
        return err;
    }
}

export function validateTargetDirectories(document: IDocument, config : CompilerConfig) {
    const targetCSSDirectory = inferTargetCSSDirectory(document, config);
    let err = safeMkdir(targetCSSDirectory);
    if (err) {
        return err
    }
    const targetMinifiedDirectory = inferTargetMinifiedCSSDirectory(document, config);
    err = safeMkdir(targetMinifiedDirectory);
    if (err) {
        return err
    }
    return null;
}

export function getOutputCSS(document: IDocument, config : CompilerConfig, _log: ILog): string {
    const targetDirectory = inferTargetCSSDirectory(document, config);
    const fileonly = document.getFileOnly();
    return path.join(targetDirectory, fileonly + '.css');
}

export function getOutputMinifiedCSS(document: IDocument, config: CompilerConfig, _log: ILog): string {
    const targetMinifiedDirectory = inferTargetMinifiedCSSDirectory(document, config);
    const fileonly = document.getFileOnly();
    return path.join(targetMinifiedDirectory, fileonly + '.min.css');
}
