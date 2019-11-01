/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

let worker

// eslint-disable-next-line import/no-webpack-loader-syntax
const DemoboardWorker = require('worker-loader!@frontarm/demoboard-worker')
if (typeof Worker !== 'undefined') {
  const { wrap } = require('comlink')
  worker = wrap(new DemoboardWorker())
} else {
  worker = DemoboardWorker
}

module.exports = worker
