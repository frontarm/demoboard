/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import dynamicImportPlugin from 'babel-plugin-dynamic-import-node'
import styledComponentsPlugin from 'babel-plugin-styled-components'

import register from '../register'
import preventInfiniteLoopsPlugin from './babel-plugin-prevent-infinite-loops'

register(
  'babel',
  ({ babelDetective, babelTransform, errors }) =>
    async function demoboardBabelTransform({ originalSource, pathname }) {
      try {
        const babelOutput = babelTransform(originalSource, {
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
            babelDetective,
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

        throw new errors.DemoboardTransformError({
          sourceFile: pathname,
          message: e.message,
          lineNumber: positionMatch && positionMatch[1],
          charNumber: positionMatch && positionMatch[2],
        })
      }
    },
)
