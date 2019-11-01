/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

// When testing, don't worry about putting everything in a worker -- just
// require it like any other module.
module.exports = () => require('@frontarm/demoboard-worker')
