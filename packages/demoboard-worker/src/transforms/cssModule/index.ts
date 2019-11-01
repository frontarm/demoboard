/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import postcss from 'postcss'
import postcssModules from 'postcss-modules'
import register from '../register'

register(
  'cssModule',
  ({ errors }) =>
    async function transpileCSSModule({ css, originalSource, pathname }) {
      if (css === null) {
        return {
          transformedSource: `module.exports = {}`,
          originalSource,
          map: null,
          pathname,
          dependencies: [],
          prettyCode: '',
          css: '',
        }
      }

      let jsonString = '{}'
      let plugins = [
        postcssModules({
          getJSON: function(cssFileName: any, json: any, outputFileName: any) {
            jsonString = JSON.stringify(json)
          },
        }),
      ]

      try {
        let result = await postcss(plugins).process(css)

        return {
          transformedSource: `module.exports = ` + jsonString,
          originalSource,
          map: result.map,
          pathname,
          dependencies: [],
          prettyCode: '',
          css: result.css,
        }
      } catch (error) {
        throw new errors.DemoboardTransformError({
          sourceFile: pathname,
          message: error.message,
        })
      }
    },
)
