/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import babelPluginDetective from '../babel/babel-plugin-detective'
import { DemoboardTransformError } from '../../build/DemoboardBuildErrors'
import { DemoboardTransformer } from '../../types'

const { transform } = require('@babel/standalone')

const transformMDX: DemoboardTransformer = async function transpileMDX({
  originalSource,
  pathname,
}) {
  const { transformMDX } = await import('../mdx/transformMDX')

  try {
    const jsx = transformMDX(originalSource)

    let originalReactImport = originalSource.match(
      /import\s+React\s+from (?:'|")react(@.*)?(?:'|")/,
    )
    let imports = `import { mdx } from '@mdx-js/react'\n`
    if (!originalReactImport) {
      imports += `import React from 'react'\n`
    }

    const babelOutput = transform(imports + jsx, {
      filename: pathname,

      presets: ['es2015', 'react'],
      plugins: [
        'syntax-object-rest-spread',
        'proposal-object-rest-spread',
        babelPluginDetective,
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

    throw new DemoboardTransformError({
      sourceFile: pathname,
      message: e.message,
      lineNumber: positionMatch && positionMatch[1],
      charNumber: positionMatch && positionMatch[2],
    })
  }
}

export default transformMDX
