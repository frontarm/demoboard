/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardWorkerTransform } from '../types'

// This is substituted in by the build process
const transforms: {
  [name: string]: () => Promise<{ default: DemoboardWorkerTransform }>
} = process.env.TRANSFORMS as any

export default transforms
