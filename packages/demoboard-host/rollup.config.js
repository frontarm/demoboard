/**
 * This is based on the rollup config from Redux
 * Copyright (c) 2015-present Dan Abramov
 */

import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

const env = process.env.NODE_ENV
const config = {
  input: {
    'index': 'src/index.ts',
    'worker/index': 'src/worker/index.ts',
  },

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

  experimentalCodeSplitting: true,

  plugins: [
    nodeResolve({
      browser: true,
      main: true,
      preferBuiltins: true,
    }),
    commonjs(),
    typescript({
      abortOnError: false,
      module: 'ESNext',
    }),
  ],
}

if (env === 'production') {
  config.plugins.push(
    replace({
      // Don't set the env unless building for production, as it will cause
      // rollup to shake out the minified runtime.
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    terser()
  )
}

export default config