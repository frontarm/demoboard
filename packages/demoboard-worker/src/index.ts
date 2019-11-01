/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

interface DemoboardWorker extends Worker {
  lazyRequire: any
}

declare const self: DemoboardWorker

// This is used by the code injected by the build process to load transforms
self.lazyRequire = function lazyRequire(name: string) {
  return new Promise((resolve, reject) =>
    // eslint-disable-next-line
    (require as any).ensure([name], function(require: any) {
      resolve(require(name))
    }),
  )
}

export { fetchDependency } from './fetchDependency'
export { build, clearBuildCache } from './build'
export * from './types'
