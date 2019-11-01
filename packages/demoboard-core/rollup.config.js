/**
 * This is based on the rollup config from Redux
 * Copyright (c) 2015-present Dan Abramov
 */

import commonjs from 'rollup-plugin-commonjs'
import nodeBuiltins from 'rollup-plugin-node-builtins'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

const {
  version: runtimeVersion,
} = require('@frontarm/demoboard-runtime/package.json')
const DEFAULT_DEMOBOARD_CONTAINER_URL =
  'https://demoboard.frontarm.com/container-' + runtimeVersion + '.html'

const env = process.env.NODE_ENV
const config = {
  input: 'src/index.ts',

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
      id.indexOf('workerize-proxy-loader!') === 0 ||
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
    commonjs(),
    replace({
      'process.env.DEFAULT_DEMOBOARD_CONTAINER_URL': JSON.stringify(
        DEFAULT_DEMOBOARD_CONTAINER_URL,
      ),
    }),
    typescript({
      abortOnError: env === 'production',
      module: 'ESNext',
      useTsconfigDeclarationDir: true,
    }),
  ],
}

if (env === 'production') {
  config.plugins.push(
    replace({
      // Don't set the env unless building for production, as it will cause
      // rollup to shake out the minified runtime.
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    terser(),
  )
}

export default config
