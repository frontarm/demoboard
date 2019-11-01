/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import * as Comlink from 'comlink'
import { DemoboardWorkerGlobalScope } from './types'

import { fetchDependency } from './fetchDependency'
import { build, clearBuildCache } from './build'

declare const self: DemoboardWorkerGlobalScope

const worker = {
  fetchDependency,
  build,
  clearBuildCache,
}

if (
  typeof WorkerGlobalScope !== 'undefined' &&
  self instanceof WorkerGlobalScope
) {
  Comlink.expose(worker, self)
}

export type DemoboardWorker = typeof worker

export * from './types'

export default worker
