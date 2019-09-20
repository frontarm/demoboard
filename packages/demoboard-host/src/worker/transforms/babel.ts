/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import detectivePlugin from '../babel/babel-plugin-detective'
import preventInfiniteLoopsPlugin from '../babel/babel-plugin-prevent-infinite-loops'
import { DemoboardTransformError } from '../../build/DemoboardBuildErrors'
import { DemoboardTransformer } from '../../types'

const { transform } = require('@babel/standalone')
const dynamicImportPlugin = require('babel-plugin-dynamic-import-node')
const styledComponentsPlugin = require('babel-plugin-styled-components')

const babelTransform: DemoboardTransformer = async function demoboardBabelTransform({
  originalSource,
  pathname,
}) {
  try {
    const babelOutput = transform(originalSource, {
      filename: pathname,

      presets: ['es2015', 'es2016', 'es2017', 'react', 'stage-3'],
      plugins: [
        'syntax-object-rest-spread',
        'proposal-object-rest-spread',
        preventInfiniteLoopsPlugin,
        dynamicImportPlugin,
        [
          styledComponentsPlugin,
          {
            // Don't attempt to make use of the filesystem
            fileName: false,
            ssr: false,
            cssProp: true,
          },
        ],
        detectivePlugin,
      ],

      // This keeps comments on the correct line
      retainLines: true,

      sourceMaps: true,
      sourceType: 'module',
    })

    return {
      css: null,
      dependencies: babelOutput.metadata.requires || [],
      map: babelOutput.map,
      originalSource,
      pathname,
      transformedSource: babelOutput.code,
    }
  } catch (e) {
    console.error(e)

    const positionMatch = e.message.match(/\((\d+):(\d+)\)/)

    throw new DemoboardTransformError({
      sourceFile: pathname,
      message: e.message,
      lineNumber: positionMatch && positionMatch[1],
      charNumber: positionMatch && positionMatch[2],
    })
  }
}

export default babelTransform
