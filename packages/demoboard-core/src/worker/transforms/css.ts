/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardTransformer } from '../../types'

const cssTransform: DemoboardTransformer = async function transpileCSS({
  originalSource,
  pathname,
}) {
  return {
    css: originalSource,
    dependencies: [],
    originalSource,
    map: null,
    pathname,
    transformedSource: 'module.exports = {}',
  }
}

export default cssTransform
