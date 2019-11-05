/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import register from '../register'
import rehypePrism from './rehype-prism'

import emoji from 'remark-emoji'
import images from 'remark-images'
import textr from 'remark-textr'
import slug from 'remark-slug'
import typographicBase from 'typographic-base'
import mdx from '@mdx-js/mdx'

register(
  'mdx',
  ({ babelDetective, babelTransform, errors }) =>
    async function transpileMDX({ originalSource, pathname }) {
      try {
        const jsx = mdx
          .sync(originalSource, {
            transformSync: babelTransform,
            remarkPlugins: [
              slug,
              images,
              emoji,
              [textr, { plugins: [typographicBase] }],
            ],

            // FIXME: This currently seems to break the UMD build
            // rehypePlugins: [rehypePrism],
          })
          .trim()

        let originalReactImport = originalSource.match(
          /import\s+React\s+from (?:'|")react(@.*)?(?:'|")/,
        )
        let imports = `import { mdx } from '@mdx-js/react'\n`
        if (!originalReactImport) {
          imports += `import React from 'react'\n`
        }

        const babelOutput = babelTransform(imports + jsx, {
          filename: pathname,

          presets: ['es2015', 'react'],
          plugins: [
            'syntax-object-rest-spread',
            'proposal-object-rest-spread',
            babelDetective,
          ],

          compact: false,
          sourceMaps: true,
          sourceType: 'module',
        })

        return {
          css: null,
          transformedSource: babelOutput.code,
          originalSource,
          map: babelOutput.map,
          pathname,
          dependencies: babelOutput.metadata.requires || [],
        }
      } catch (e) {
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
