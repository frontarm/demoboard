/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import * as Comlink from 'comlink'
import { DemoboardWorker as IDemoboardWorker } from '@frontarm/demoboard-worker'
import { DemoboardResourceURLs } from './DemoboardResourceURLs'

let worker: IDemoboardWorker

async function getWorker(
  resourceURLs: DemoboardResourceURLs,
): Promise<IDemoboardWorker> {
  if (worker) {
    return worker
  }

  let mod =
    // eslint-disable-next-line import/no-webpack-loader-syntax
    require('worker-loader!@frontarm/demoboard-worker')

  if (typeof Worker === 'undefined') {
    // In the test environment, no worker is used, and the underlying
    // worker object is just returned directly.
    return mod
  } else {
    const DemoboardWorker = new mod()
    worker = Comlink.wrap(DemoboardWorker)
    return worker
  }
}

export default getWorker
