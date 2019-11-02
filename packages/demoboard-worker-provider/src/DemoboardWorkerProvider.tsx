/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import * as Comlink from 'comlink'
import * as React from 'react'
import { DemoboardWorkerContext } from '@frontarm/demoboard-core'
import { DemoboardWorker as IDemoboardWorker } from '@frontarm/demoboard-worker'

function createWorker() {
  // eslint-disable-next-line import/no-webpack-loader-syntax
  let mod = require('worker-loader!@frontarm/demoboard-worker')
  const DemoboardWorker = new mod()
  return Comlink.wrap(DemoboardWorker)
}

// Leave the workers empty on environments where workers aren't supported,
// e.g. on Node
const worker: IDemoboardWorker =
  typeof Worker === 'undefined' ? ({} as any) : createWorker()

const DemoboardWorkerProvider: React.FC = ({ children }) => {
  return (
    <DemoboardWorkerContext.Provider
      value={{
        worker,
      }}>
      {children}
    </DemoboardWorkerContext.Provider>
  )
}

export default DemoboardWorkerProvider
