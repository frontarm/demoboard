/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import { DemoboardExporter, DemoboardGenerator } from './types'

export interface DemoboardContext {
  exporterLoaders: {
    [name: string]: () => Promise<{ default: DemoboardExporter }>
  }
  generators: {
    [name: string]: DemoboardGenerator
  }
}

export const DemoboardContext = React.createContext<DemoboardContext>({
  exporterLoaders: {},
  generators: {
    'index-html': require('./generators/indexHTMLGenerator').default,
    'markdown-css': require('./generators/markdownCSSGenerator').default,
  },
})
