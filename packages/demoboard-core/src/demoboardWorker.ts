/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { isInCodeSandbox } from './utils/isInCodeSandbox'
import * as Comlink from 'comlink'
import { DemoboardWorker as IDemoboardWorker } from '@frontarm/demoboard-worker'
import { version as workerVersion } from '@frontarm/demoboard-worker/package.json'

let workerPromise: Promise<IDemoboardWorker>

async function createWorkerFromUnpkg() {
  const urlToFetch = `https://unpkg.com/@frontarm/demoboard-worker@${workerVersion}dist/commonjs/index.js`

  const res = await fetch(urlToFetch, { credentials: 'same-origin' })
  if (!res.ok) {
    throw new Error("Couldn't load demoboard-worker")
  }
  const source = await res.text()
  const blob = new Blob([source], { type: 'text/javascript' })
  const workerURL = URL.createObjectURL(blob)
  const worker = new Worker(workerURL)
  return worker
}

export default function getWorker(): Promise<IDemoboardWorker> {
  if (!workerPromise) {
    workerPromise = new Promise(async resolve => {
      let DemoboardWorker: Worker
      if (isInCodeSandbox()) {
        DemoboardWorker = await createWorkerFromUnpkg()
      } else {
        let mod =
          // eslint-disable-next-line import/no-webpack-loader-syntax
          require('worker-loader!@frontarm/demoboard-worker')

        if (typeof Worker === 'undefined') {
          return resolve(mod)
        } else {
          DemoboardWorker = new mod()
        }
      }

      resolve(Comlink.wrap(DemoboardWorker) as any)
    })
  }

  return workerPromise
}
