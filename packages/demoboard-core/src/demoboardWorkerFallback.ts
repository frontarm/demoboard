/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { version as workerVersion } from '@frontarm/demoboard-worker/package.json'

async function createWorkerFromUnpkg() {
  console.log('Bundled worker not detected, loading fallback from unpkg.')

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

createWorkerFromUnpkg.demoboardWorkerFallback = true

module.exports = createWorkerFromUnpkg
