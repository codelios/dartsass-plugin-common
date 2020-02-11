// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';

import chokidar, { FSWatcher } from 'chokidar';


export function cwatchCSS(pattern: string, fnOnFile: (docPath: string)=>any , fnOnDeleteFile: (docPath: string)=> any) : FSWatcher {
    const watcher = chokidar.watch(pattern, {
        ignored: /[\/\\]\./,
        persistent: true,
    });
    // Add event listeners.
    watcher
    .on('add', docPath => fnOnFile(docPath))
    .on('change', docPath => fnOnFile(docPath))
    .on('unlink', docPath => fnOnDeleteFile(docPath));
    return watcher;
}

export function closeCWatcher(watcher: FSWatcher) {
    watcher.close().then(
        () => {

        }
    );
}