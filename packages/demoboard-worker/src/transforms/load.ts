/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { transform } from '@babel/standalone'
import * as errors from '../DemoboardBuildErrors'
import babelDetective from '../babel/babel-plugin-detective'
import {
  DemoboardWorkerTransform,
  DemoboardWorkerGlobalScope,
  DemoboardWorkerTransformContext,
} from '../types'
import { version } from '../../package.json'
import Deferred from '../utils/Deferred'
import localTransformImporters from './index'

const loadedTransforms: {
  [name: string]: {
    transform?: DemoboardWorkerTransform
    deferreds?: Deferred<DemoboardWorkerTransform>[]
  }
} = {}

const transformContext: DemoboardWorkerTransformContext = {
  babelTransform: transform,
  babelDetective,
  errors,
}

declare const self: DemoboardWorkerGlobalScope

self.demoboard = {
  registerTransform: (
    name: string,
    factory: (
      context: DemoboardWorkerTransformContext,
    ) => DemoboardWorkerTransform,
  ) => {
    const transform = factory(transformContext)
    let loaded = loadedTransforms[name]
    if (!loaded) {
      loaded = loadedTransforms[name] = {}
    }
    loaded.transform = transform
    if (loaded.deferreds) {
      for (let deferred of loaded.deferreds) {
        deferred.resolve(transform)
      }
    }
  },
}

export async function loadTransform(
  name: string,
  transformLoadingStrategy?: 'unpkg',
): Promise<DemoboardWorkerTransform> {
  let loaded = loadedTransforms[name]
  if (loaded && loaded.transform) {
    return loaded.transform
  }
  if (!loaded) {
    loaded = loadedTransforms[name] = {}
  }
  if (!loaded.deferreds) {
    loaded.deferreds = []
  }

  const deferred = new Deferred<DemoboardWorkerTransform>()
  loaded.deferreds.push(deferred)

  if (transformLoadingStrategy === 'unpkg') {
    const urlToFetch = `https://unpkg.com/@frontarm/demoboard-worker@${version}dist/commonjs/transforms/${name}.js`

    const res = await fetch(urlToFetch, { credentials: 'same-origin' })
    if (!res.ok) {
      throw new errors.DemoboardFetchFailedError({
        url: urlToFetch,
        sourceFile: name,
        status: res.status + ' ' + res.statusText,
      })
    }
    const source = await res.text()
    const blob = new Blob([source], { type: 'text/javascript' })
    const workerURL = URL.createObjectURL(blob)

    self.importScripts(workerURL)
  } else {
    const transformImporter = localTransformImporters[name as any]
    transformImporter()
  }

  return deferred.promise
}
