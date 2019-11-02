/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import * as Comlink from 'comlink'
import { DemoboardWorker as IDemoboardWorker } from '@frontarm/demoboard-worker'

let workerPromise: Promise<IDemoboardWorker>

export default function getWorker(): Promise<IDemoboardWorker> {
  if (!workerPromise) {
    workerPromise = new Promise(async resolve => {
      let mod =
        // eslint-disable-next-line import/no-webpack-loader-syntax
        require('worker-loader!@frontarm/demoboard-worker')

      if (mod.demoboardWorkerFallback) {
        return resolve(await mod())
      } else if (typeof Worker === 'undefined') {
        return resolve(mod)
      } else {
        const DemoboardWorker = new mod()
        resolve(Comlink.wrap(DemoboardWorker) as any)
      }
    })
  }

  return workerPromise
}
