/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

// We don't want to import the full library, as it is large and uses CommonJS
// so tree shaking is unlikely to work. Instead, let's just import the one
// bit we use.
const { SourceMapConsumer } = require('source-map/lib/source-map-consumer')
module.exports = { SourceMapConsumer }
