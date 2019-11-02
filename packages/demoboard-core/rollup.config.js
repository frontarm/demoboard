/**
 * This is based on the rollup config from Redux
 * Copyright (c) 2015-present Dan Abramov
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
  input: [
    'src/index.ts',
    'src/demoboardWorker.ts',
    'src/demoboardWorker.fallback.ts',
  ],

  output: [
    {
      dir: 'dist/es',
      format: 'es',
      sourcemap: true,
    },
  ],

  external(id) {
    if (
      /^\w/.test(id) ||
      id[0] === '@' ||
      id.indexOf('worker-loader!') === 0 ||
      id.indexOf('file-loader!') === 0
    ) {
      return true
    }
  },

  plugins: [
    nodeBuiltins(),
    nodeResolve({
      mainFields: ['module', 'main', 'jsnext:main'],
    }),
    commonjs({
      ignore: ['comlink'],
    }),
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
