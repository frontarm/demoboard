/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import {
  DemoboardWorkerGlobalScope,
  DemoboardWorkerTransformFetchOptions,
} from '../types'
import { DemoboardFetchFailedError } from '../DemoboardBuildErrors'

declare const self: DemoboardWorkerGlobalScope

export const defaultTransformFetchOptions: DemoboardWorkerTransformFetchOptions = {
  credentials: 'same-origin' as const,
}

export async function fetchTransformFromNetwork(
  name: string,
  fetchOptions: DemoboardWorkerTransformFetchOptions = defaultTransformFetchOptions,
): Promise<void> {
  const { baseURL, overrideURLs = {}, ...options } = fetchOptions
  const transformURL = overrideURLs[name]
  const urlToFetch = transformURL || baseURL + name + '.js'
  const res = await fetch(urlToFetch, options)
  if (!res.ok) {
    throw new DemoboardFetchFailedError({
      url: urlToFetch,
      sourceFile: name,
      status: res.status + ' ' + res.statusText,
    })
  }
  const source = await res.text()
  const blob = new Blob([source], { type: 'text/javascript' })
  const workerURL = URL.createObjectURL(blob)

  self.importScripts(workerURL)
}
