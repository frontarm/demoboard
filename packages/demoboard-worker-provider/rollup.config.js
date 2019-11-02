/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeBuiltins from 'rollup-plugin-node-builtins'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

const env = process.env.NODE_ENV
const config = {
  input: 'src/DemoboardWorkerProvider.tsx',

  output: [
    {
      dir: 'dist/es',
      format: 'es',
      sourcemap: true,
    },
  ],

  external(id) {
    if (/^\w/.test(id) || id[0] === '@' || id.indexOf('worker-loader!') === 0) {
      return true
    }
  },

  plugins: [
    nodeBuiltins(),
    nodeResolve({
      mainFields: ['module', 'main', 'jsnext:main'],
    }),
    commonjs(),
    json(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    typescript({
      abortOnError: env === 'production',
      module: 'ESNext',
      useTsconfigDeclarationDir: true,
    }),
  ],
}

if (env === 'production') {
  config.plugins.push(terser())
}

export default config
