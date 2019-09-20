/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import {
  DemoboardBuildError,
  DemoboardTransformError,
} from '../build/DemoboardBuildErrors'
import { DemoboardTransformedModule } from './DemoboardTransformedModule'

export interface DemoboardWorkerBuildResult {
  transformedModules: {
    [name: string]: DemoboardTransformedModule
  }
  shouldRegenerateHTML: boolean
  error: null | DemoboardBuildError | DemoboardTransformError
}
