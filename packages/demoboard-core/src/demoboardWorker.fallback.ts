/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import * as Comlink from 'comlink'
import { DemoboardWorker as IDemoboardWorker } from '@frontarm/demoboard-worker'
import { DemoboardResourceURLs } from './DemoboardResourceURLs'

let workerPromise: Promise<IDemoboardWorker>
async function getWorker(resourceURLs: DemoboardResourceURLs) {
  if (!workerPromise) {
    workerPromise = fetchAndCreateWorker(resourceURLs)
  }
  return workerPromise
}

async function fetchAndCreateWorker(
  resourceURLs: DemoboardResourceURLs,
): Promise<IDemoboardWorker> {
  const res = await fetch(resourceURLs.worker, { credentials: 'same-origin' })
  if (!res.ok) {
    throw new Error("Couldn't load demoboard-worker")
  }
  const source = await res.text()
  const blob = new Blob([source], { type: 'text/javascript' })
  const workerURL = URL.createObjectURL(blob)
  const worker = Comlink.wrap<IDemoboardWorker>(new Worker(workerURL))

  return {
    fetchDependency: options => worker.fetchDependency(options),
    clearBuildCache: id => worker.clearBuildCache(id),
    build: options =>
      worker.build({
        ...options,
        transformFetchOptions: {
          baseURL: resourceURLs.workerTransformBase,
          overrideURLs: resourceURLs.workerTransformOverrides,
          ...options.transformFetchOptions,
        },
      }),
  }
}

export default getWorker
