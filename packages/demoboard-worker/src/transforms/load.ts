/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import * as Babel from '@babel/standalone'
import types from '@babel/types'
import * as errors from '../DemoboardBuildErrors'
import babelDetective from '../babel/babel-plugin-detective'
import {
  DemoboardWorkerTransform,
  DemoboardWorkerGlobalScope,
  DemoboardWorkerTransformContext,
  DemoboardWorkerTransformFetchOptions,
} from '../types'
import Deferred from '../utils/Deferred'
import { fetchTransformFromNetwork } from './fetchTransformFromNetwork'
import getTransformImporters from './getTransformImporters'

// MDX needs access to Babel, and there's no way to pass it in... so the
// build system rewrites the import to use this.
;(self as any).Babel = {
  transformSync: Babel.transform,
  types,
}

function wrapTransform(name: string, importFunction?: Function) {
  return (options?: DemoboardWorkerTransformFetchOptions) => {
    if (options || !importFunction) {
      fetchTransformFromNetwork(name, options)
    } else {
      importFunction()
    }
  }
}

const importers = getTransformImporters(wrapTransform)

const loadedTransforms: {
  [name: string]: {
    transform?: DemoboardWorkerTransform
    deferreds?: Deferred<DemoboardWorkerTransform>[]
  }
} = {}

const transformContext: DemoboardWorkerTransformContext = {
  babelTransform: Babel.transform,
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
  transformLoadingStrategy?: DemoboardWorkerTransformFetchOptions,
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

  importers[name](transformLoadingStrategy)

  return deferred.promise
}
