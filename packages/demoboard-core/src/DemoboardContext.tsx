/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardWorker } from '@frontarm/demoboard-worker'

import * as React from 'react'

import { DemoboardExporter, DemoboardGenerator } from './types'
import indexHTMLGenerator from './generators/indexHTMLGenerator'
import markdownCSSGenerator from './generators/markdownCSSGenerator'
import {
  defaultContainerURL,
  defaultRuntimeURL,
  defaultWorkerURLs,
} from './defaultURLs'
import getWorker from './worker/getWorker'

export interface DemoboardContext {
  exporterLoaders: {
    [name: string]: () => Promise<{ default: DemoboardExporter }>
  }
  generators: {
    [name: string]: DemoboardGenerator
  }
  containerURL: string
  runtimeURL: string
}

export const DemoboardContext = React.createContext<DemoboardContext>({
  exporterLoaders: {},
  generators: {
    'index-html': indexHTMLGenerator,
    'markdown-css': markdownCSSGenerator,
  },
  containerURL: defaultContainerURL,
  runtimeURL: defaultRuntimeURL,
})

export interface DemoboardWorkerContext {
  readonly worker: DemoboardWorker
}

let defaultWorker: DemoboardWorker
export const DemoboardWorkerContext = React.createContext<
  DemoboardWorkerContext
>({
  // Lazily set the worker, so as not to fetch the worker this way if the
  // app specifies another worker provider
  get worker() {
    if (!defaultWorker) {
      defaultWorker = getWorker(defaultWorkerURLs)
    }
    return defaultWorker
  },
})
