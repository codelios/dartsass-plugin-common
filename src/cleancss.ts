// Copyright (c) 2018-19 MalvaHQ
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";
import { CSSFile } from "./cssfile";

const CleanCSS = require("clean-css");

export class CleanCSSMinifier {
  public async minify(
    src: CSSFile,
    disableSourceMap: boolean,
    comment: Buffer
  ): Promise<CSSFile> {
    return this.minifySync(src, disableSourceMap, comment);
  }

  public minifySync(
    src: CSSFile,
    disableSourceMap: boolean,
    comment: Buffer
  ): CSSFile {
    const cleancss = new CleanCSS({
      sourceMap: !disableSourceMap,
    });
    let data = null;
    if (src.sourceMap !== undefined && src.sourceMap !== null) {
      data = cleancss.minify(src.css, src.sourceMap);
    } else {
      data = cleancss.minify(src.css);
    }
    return {
      css: data.styles + comment,
      sourceMap: !disableSourceMap ? data.sourceMap : undefined,
    };
  }
}
