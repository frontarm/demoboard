/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardGeneratedFile } from './DemoboardGeneratedFile'
import { DemoboardTransformedModule } from './DemoboardTransformedModule'

export type DemoboardBuildStatus = 'busy' | 'error' | 'success'

export interface DemoboardBuild {
  config: DemoboardBuildConfig
  status: DemoboardBuildStatus
  version: number

  /**
   * Indicates that newer build config is available, but it hasn't been built
   * as the build is currently paused.
   */
  stale: boolean

  error: null | any
  html: null | string
  transformedModules: null | {
    [name: string]: DemoboardTransformedModule
  }
}

export interface DemoboardBuildConfig {
  baseURL?: string

  /**
   * The number of milliseconds to debounce changes before rebuilding.
   */
  debounce?: number

  dependencies?: {
    [packageName: string]: string
  }

  entryPathname: string

  /**
   * An object that will be passed to generated sources, and can be used to
   * configure generated sources for individual users, or based on the
   * project's metadata.
   */
  generatorContext?: any

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

  sources: { [pathname: string]: string | DemoboardGeneratedFile }

  runtimeURL?: string
}