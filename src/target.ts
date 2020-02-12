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

export function getRelativeDirectory(projectRoot: string, srcdir: string) : string {
    if (!path.isAbsolute(srcdir)) {
        return srcdir;
    }
    return path.relative(projectRoot, srcdir);
}

export function inferTargetCSSDirectory(document: IDocument, config: CompilerConfig): string {
    let targetDirectory = path.dirname(document.getFileName());
    const projectRoot = document.getProjectRoot();
    if (config.targetDirectory.length > 0) {
        targetDirectory = xformPath(projectRoot, config.targetDirectory);
    }
    return targetDirectory;
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
    return null;
}

export function getOutputCSS(document: IDocument, config : CompilerConfig, _log: ILog): string {
    const targetDirectory = inferTargetCSSDirectory(document, config);
    const fileonly = document.getFileOnly();
    return path.join(targetDirectory, fileonly + '.css');
}

export function getOutputMinifiedCSS(document: IDocument, config: CompilerConfig, _log: ILog): string {
    const targetDirectory = inferTargetCSSDirectory(document, config);
    return getMinCSS(document.getFileName(), targetDirectory, '.scss');
}

export function getMinCSS(docPath: string, dir: string|null, ext: string|null) : string {
    if (ext === undefined || ext === null) {
        ext = ".css";
    }
    const fileNameOnly = path.basename(docPath, ext);
    if (dir === undefined || dir === null) {
        dir = path.dirname(docPath);
    }
    return path.join(dir, fileNameOnly + '.min.css');
}

export function isMinCSS(docPath: string) {
    return docPath.endsWith('.min.css');
}

export function isCSSFile(docPath: string) {
    return  docPath.endsWith('.css');
}

export function doesContainSpaces(value: string): boolean {
    return value.indexOf(' ') !== -1;
}