/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import {
  DemoboardWorkerBuildRule,
  DemoboardWorkerTransformFetchOptions,
  DemoboardWorkerTransformedModule,
} from '@frontarm/demoboard-worker'

export type DemoboardBuildStatus = 'busy' | 'error' | 'success'

export interface DemoboardBuild {
  config: DemoboardBuildConfig
  status: DemoboardBuildStatus
  version: number

  id: string

  containerURL: string
  runtimeURL: string

  /**
   * Indicates that newer build config is available, but it hasn't been built
   * as the build is currently paused.
   */
  stale: boolean

  error: null | any
  html: null | string
  transformedModules: null | {
    [name: string]: DemoboardWorkerTransformedModule
  }
}

export interface DemoboardBuildConfig {
  baseURL?: string

  buildRules?: DemoboardWorkerBuildRule[]

  containerURL?: string

  /**
   * The number of milliseconds to debounce changes before rebuilding.
   */
  debounce?: number

  dependencies?: {
    [packageName: string]: string
  }

  entryPathname: string

  /**
   * Specify packages/modules that should be mocked with other packages/modules.
   */
  mocks?: { [module: string]: string }

  /**
   * If true, the build will be paused without removing the cache, and
   * the build will be considered `busy`.
   *
   * This should always be set to true when rendering server-side. It also
   * can be set to true while the demoboard is off screen.
   */
  pause?: boolean

  runtimeURL?: string

  sources: { [pathname: string]: string }

  transformFetchOptions?: DemoboardWorkerTransformFetchOptions
}
