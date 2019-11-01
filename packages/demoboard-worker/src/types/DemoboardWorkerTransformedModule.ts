/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

export interface DemoboardWorkerTransformedModule {
  /**
   * Any CSS is stored in a separate variable, so that a single module can
   * output both JavaScript and CSS (allowing for CSS Modules support).
   */
  css: null | string

  dependencies: string[]
  map: null | any
  originalSource: string
  pathname: string
  transformedSource: string
}
