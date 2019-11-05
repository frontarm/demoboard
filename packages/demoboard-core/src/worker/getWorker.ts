/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardWorker } from '@frontarm/demoboard-worker'
import getWorkerByFetch, { DemoboardWorkerURLs } from './getWorkerByFetch'

function getWorker(urls: DemoboardWorkerURLs): DemoboardWorker {
  // If we're in a demoboard, instead of loading the worker again, let's
  // use the parent demoboard's worker.
  const demoboard: any = (typeof window === 'undefined' ? {} : (window as any))
    .demoboard
  if (demoboard && demoboard.worker) {
    return demoboard.worker
  }

  return getWorkerByFetch(urls)
}

export default getWorker
