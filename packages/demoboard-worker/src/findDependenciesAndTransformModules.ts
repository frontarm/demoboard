/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { transform } from '@babel/standalone'
import babelPluginDetective from './babel/babel-plugin-detective'

// TODO: convert this from a babel plugin to a function that walks an ast,
// and then just return the ast as part of the transpiler output.

export default function findDependenciesAndTransformModules(source: string) {
  let babelOutput = transform(source, {
    plugins: [
      'syntax-object-rest-spread',
      'transform-modules-commonjs',
      babelPluginDetective,
    ],

    compact: false,
    sourceMaps: false,
    sourceType: 'module',
  })

  return {
    dependencies: babelOutput.metadata.requires || [],
    code: babelOutput.code,
  }
}
