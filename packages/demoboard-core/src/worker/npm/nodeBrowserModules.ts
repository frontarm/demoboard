/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

export default {
  child_process: null,
  cluster: null,
  console: 'console-browserify',
  constants: 'constants-browserify',
  crypto: 'crypto-browserify',
  dgram: null,
  dns: null,
  domain: 'domain-browser',
  fs: null,
  http: 'stream-http',
  https: 'https-browserify',
  module: null,
  net: null,
  os: 'os-browserify',
  path: 'path-browserify',
  querystring: 'querystring-es3',
  readline: null,
  repl: null,
  stream: 'stream-browserify',
  _stream_duplex: 'readable-stream',
  _stream_passthrough: 'readable-stream',
  _stream_readable: 'readable-stream',
  _stream_transform: 'readable-stream',
  _stream_writable: 'readable-stream',
  sys: 'util',
  timers: 'timers-browserify',
  tls: null,
  tty: 'tty-browserify',
  vm: 'vm-browserify',
  zlib: 'browserify-zlib',
} as {
  [name: string]: null | string
}
