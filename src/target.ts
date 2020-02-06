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
import * as fs from 'fs';

export function getWatchTargetDirectory(srcdir: string,  config: CompilerConfig): string {
    let targetDirectory = srcdir;
    if (config.targetDirectory.length > 0) {
        targetDirectory = config.targetDirectory;
    }
    return targetDirectory;
}

export function getWatchMinifiedTargetDirectory(srcdir: string, config: CompilerConfig): string {
    let targetMinifiedDirectory = srcdir;
    if (config.targetMinifiedDirectory.length > 0) {
        targetMinifiedDirectory = config.targetMinifiedDirectory;
    }
    if (config.targetMinifiedDirectory.length === 0 && config.targetDirectory.length > 0) {
        targetMinifiedDirectory = config.targetDirectory;
    }
    return targetMinifiedDirectory;
}

export function getRelativeDirectory(srcdir: string, projectRoot: string) : string {
    return srcdir
}

export function inferTargetCSSDirectory(document: IDocument, config: CompilerConfig): string {
    let targetDirectory = path.dirname(document.getFileName());
    const projectRoot = document.getProjectRoot();
    if (config.targetDirectory.length > 0) {
        targetDirectory = xformPath(projectRoot, config.targetDirectory);
    }
    return targetDirectory;
}

export function inferTargetMinifiedCSSDirectory(document: IDocument, config: CompilerConfig): string {
    let targetMinifiedDirectory = path.dirname(document.getFileName());
    const projectRoot = document.getProjectRoot();
    if (config.targetMinifiedDirectory.length > 0) {
        targetMinifiedDirectory = xformPath(projectRoot, config.targetMinifiedDirectory);
    } 
    if (config.targetMinifiedDirectory.length === 0 && config.targetDirectory.length > 0) {
        targetMinifiedDirectory = xformPath(projectRoot, config.targetDirectory);
    }
    return targetMinifiedDirectory;
}


export function safeMkdir(directory: string): any {
    try {
        // https://stackoverflow.com/questions/31645738/how-to-create-full-path-with-nodes-fs-mkdirsync
        // Since nodejs 10.12.0
        fs.mkdirSync(directory, { recursive: true })
        return null;
    } catch (err) {
        if (err.code === 'EEXIST') {
            return null;
        }
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
    const targetDirectory = inferTargetCSSDirectory(document, config);
    let extension = '.min.css';
    if (targetDirectory !== targetMinifiedDirectory) {
        extension = '.css';
    }
    const fileonly = document.getFileOnly();
    return path.join(targetMinifiedDirectory, fileonly + extension);
}
