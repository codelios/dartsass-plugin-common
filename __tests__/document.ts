// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';
import { IDocument } from '../src/document';

export function getSassDocument(projectRoot: string, filename: string, fileonly: string): IDocument {
    const document : IDocument = {
        isSass(): boolean {
            return true;
        },
        getFileName(): string {
            return filename;
        },
        getFileOnly(): string {
            return fileonly;
        },
        getProjectRoot() {
            return projectRoot;
        }
    };
    return document;

}
