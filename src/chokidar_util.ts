// Copyright (c) 2019 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

'use strict';

import chokidar, { FSWatcher } from 'chokidar';
import { ILog } from './log';



function doWatch(pattern: string, ignorePattern: string, fnOnFile: (docPath: string)=>any , fnOnDeleteFile: (docPath: string)=> any, _log: ILog) : FSWatcher {
    const watcher = chokidar.watch(pattern, {
        ignored: ignorePattern,
        awaitWriteFinish: true,
        persistent: true,
    });
    // Add event listeners.
    watcher
    .on('add', docPath => fnOnFile(docPath))
    .on('change', docPath => fnOnFile(docPath))
    .on('unlink', docPath => fnOnDeleteFile(docPath));
    return watcher;
}

export function cssWatch(pattern: string, fnOnFile: (docPath: string)=>any , fnOnDeleteFile: (docPath: string)=> any, _log: ILog) : FSWatcher {
    const ignoreBlackListRegEx =  `[*.scss|*.min.css|*.map|*.jpg|*.png|*.html|*.js|*.ts]`;
    return doWatch(pattern, ignoreBlackListRegEx, fnOnFile, fnOnDeleteFile, _log);
}

export function scssWatch(pattern: string, fnOnFile: (docPath: string)=>any , fnOnDeleteFile: (docPath: string)=> any, _log: ILog) : FSWatcher {
    const ignoreBlackListRegEx =  `[*.css|*.min.css|*.map|*.jpg|*.png|*.html|*.js|*.ts]`;
    return doWatch(pattern, ignoreBlackListRegEx, fnOnFile, fnOnDeleteFile, _log);
}

export function closeChokidarWatcher(watcher: FSWatcher, _log: ILog) {
    watcher.close().then(
        () => {
            _log.debug(`Closed a FSWatcher`);
        }
    );
}