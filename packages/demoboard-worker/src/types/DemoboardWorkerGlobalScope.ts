/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardWorkerTransform } from './DemoboardWorkerTransform'
import { DemoboardWorkerTransformContext } from './DemoboardWorkerTransformContext'

export interface DemoboardWorkerGlobalScope extends DedicatedWorkerGlobalScope {
  demoboard: {
    registerTransform(
      name: string,
      factory: (
        context: DemoboardWorkerTransformContext,
      ) => DemoboardWorkerTransform,
    ): void
  }
}
