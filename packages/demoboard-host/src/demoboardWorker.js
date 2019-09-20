/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

// Don't create a worker on JSDOM builds
let worker
if (typeof Worker !== 'undefined') {
  // eslint-disable-next-line import/no-webpack-loader-syntax
  worker = require('workerize-proxy-loader!./worker')()
}

export default worker
