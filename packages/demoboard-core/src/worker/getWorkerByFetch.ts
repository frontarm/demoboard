/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import * as Comlink from 'comlink'
import { DemoboardWorker } from '@frontarm/demoboard-worker'

export interface DemoboardWorkerURLs {
  worker: string
  transformBase?: string
  transformOverrides?: { [name: string]: string }
}

async function fetchWorker(
  urls: DemoboardWorkerURLs,
): Promise<DemoboardWorker> {
  const res = await fetch(urls.worker, {
    credentials: 'same-origin',
  })
  if (!res.ok) {
    throw new Error("Couldn't load demoboard-worker")
  }
  const source = await res.text()
  const blob = new Blob([source], { type: 'text/javascript' })
  const workerURL = URL.createObjectURL(blob)
  return Comlink.wrap<DemoboardWorker>(new Worker(workerURL))
}

export default function getWorkerByFetch(
  urls: DemoboardWorkerURLs,
): DemoboardWorker {
  let workerPromise =
    typeof Worker === 'undefined'
      ? Promise.resolve({} as any)
      : fetchWorker(urls)
  return {
    fetchDependency: async options => {
      const worker = await workerPromise
      return worker.fetchDependency(options)
    },
    clearBuildCache: async id => {
      const worker = await workerPromise
      return worker.clearBuildCache(id)
    },
    build: async options => {
      const worker = await workerPromise
      return worker.build({
        ...options,
        transformFetchOptions: {
          // A worker using fetch needs these URLs, as it can't access the
          // transforms using `import()`
          baseURL: urls.transformBase,
          overrideURLs: urls.transformOverrides,

          ...options.transformFetchOptions,
        },
      })
    },
  }
}
