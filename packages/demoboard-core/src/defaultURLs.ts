/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */
/* eslint-disable import/no-webpack-loader-syntax */

import { version as runtimeVersion } from '@frontarm/demoboard-runtime/package.json'
import { version as workerVersion } from '@frontarm/demoboard-worker/package.json'
import { DemoboardWorkerURLs } from './worker/getWorkerByFetch'

const isProduction = (process.env.NODE_ENV as any) === 'production'
const isTest = (process.env.NODE_ENV as any) === 'test'
const jsExtension = isProduction ? '.min.js' : '.js'
const hostname =
  typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const origin = typeof window !== 'undefined' ? window.location.origin : ''

export const defaultRuntimeURL =
  process.env.DEMOBOARD_RUNTIME_URL ||
  (isProduction
    ? `https://unpkg.com/@frontarm/demoboard-runtime@${runtimeVersion}/dist/demoboard-runtime${jsExtension}`
    : !isTest
    ? // Prefer file-loader where possible, so that updates during development
      // cause an automatic refresh of the browser
      origin +
      require('!file-loader!@frontarm/demoboard-runtime/dist/demoboard-runtime.js')
    : `//${hostname}:5000/demoboard-runtime.js?${Date.now()}`)

export const defaultContainerURL =
  process.env.DEMOBOARD_CONTAINER_URL ||
  (isProduction
    ? `https://unpkg.com/@frontarm/demoboard-runtime@${runtimeVersion}/dist/container.html`
    : // This must be on a different origin for sandboxing purposes
      `//${hostname}:5000/container.html?${Date.now()}`)

export const defaultWorkerURLs: DemoboardWorkerURLs = {
  worker:
    process.env.DEMOBOARD_WORKER_URL ||
    (isProduction
      ? `https://unpkg.com/@frontarm/demoboard-worker@${workerVersion}/dist/umd/index.js`
      : !isTest
      ? origin +
        require('!file-loader!@frontarm/demoboard-worker/dist/umd/index.js')
      : 'NOT REQUIRED AS WORKER IS LOADED VIA require()'),
}

if (isProduction) {
  defaultWorkerURLs.transformBase = `https://unpkg.com/@frontarm/demoboard-worker@${workerVersion}/dist/umd/transforms/`
} else if (!isTest && process.env.DEMOBOARD_WORKER_URL !== 'parent') {
  // Not required in tests as worker is not actually inside a worker --
  // and calling require('!file-loader!') will cause an error.
  defaultWorkerURLs.transformOverrides = {
    babel:
      origin +
      require('!file-loader!@frontarm/demoboard-worker/dist/umd/transforms/babel.js'),
    css:
      origin +
      require('!file-loader!@frontarm/demoboard-worker/dist/umd/transforms/css.js'),
    cssModule:
      origin +
      require('!file-loader!@frontarm/demoboard-worker/dist/umd/transforms/cssModule.js'),
    mdx:
      origin +
      require('!file-loader!@frontarm/demoboard-worker/dist/umd/transforms/mdx.js'),
  }
}
