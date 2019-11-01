/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardWorkerGlobalScope } from '../types'

declare const self: DemoboardWorkerGlobalScope
export default self.demoboard.registerTransform
