/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardWorkerTransformFetchOptions } from '../types'

type WrapTranform = (
  name: string,
  importFunction?: Function,
) => (options?: DemoboardWorkerTransformFetchOptions) => void

declare const GET_TRANSFORM_IMPORTERS: (
  wrapTransform: WrapTranform,
) => { [name: string]: (options?: DemoboardWorkerTransformFetchOptions) => any }

export default GET_TRANSFORM_IMPORTERS
