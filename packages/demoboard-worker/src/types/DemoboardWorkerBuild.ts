/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import {
  DemoboardBuildError,
  DemoboardTransformError,
} from '@frontarm/demoboard-core/src/build/DemoboardBuildErrors'
import { DemoboardWorkerTransformedModule } from './DemoboardWorkerTransformedModule'
import { DemoboardWorkerTransformFetchOptions } from './DemoboardWorkerTransformFetchOptions'

export interface DemoboardWorkerBuildOptions {
  id: string
  sources: { [filename: string]: string }
  entryPathname: string
  rules?: DemoboardWorkerBuildRule[]
  transformFetchOptions?: DemoboardWorkerTransformFetchOptions
}

export interface DemoboardWorkerBuildRule {
  test: RegExp
  transform: string
}

export interface DemoboardWorkerBuildResult {
  transformedModules: {
    [name: string]: DemoboardWorkerTransformedModule
  }
  shouldRegenerateHTML: boolean
  error: null | DemoboardBuildError | DemoboardTransformError
}
