/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardTransformError } from '../../build/DemoboardBuildErrors'
import { DemoboardTransformer, DemoboardTransformedModule } from '../../types'

// eslint-disable-next-line import/no-webpack-loader-syntax
const sassWorker = require('!file-loader!sass.js/dist/sass.worker.js')

let sass: any

const transformSASS: DemoboardTransformer = async function transpileSass({
  originalSource,
  pathname,
}) {
  const { default: Sass } = await import('sass.js/dist/sass.js')

  if (!sass) {
    sass = new Sass(sassWorker)
  }

  return await new Promise<DemoboardTransformedModule>((resolve, reject) => {
    sass.compile(originalSource, (result: any) => {
      if (result.status === 1) {
        reject(
          new DemoboardTransformError({
            sourceFile: pathname,
            message: result.message,
            lineNumber: result.line,
          }),
        )
      } else {
        resolve({
          transformedSource: 'module.exports = {}',
          originalSource: originalSource,
          map: result.map,
          pathname,
          dependencies: [],
          css: result.text,
        })
      }
    })
  })
}

export default transformSASS
