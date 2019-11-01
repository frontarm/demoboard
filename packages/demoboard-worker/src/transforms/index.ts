/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

//
// PLEASE DON'T ADD MORE IMPORTS
//
import { DemoboardWorkerTransform } from '../types'
//
// This file's imports are rewritten by the build system. Adding more
// imports is guaranteed to give you a bad time.
//

// This is substituted in by the build process, and contains functions
// that can load transforms from the local server.
const localTransformImporters: {
  [name: string]: () => Promise<{ default: DemoboardWorkerTransform }>
} = process.env.TRANSFORMS as any

export default localTransformImporters
