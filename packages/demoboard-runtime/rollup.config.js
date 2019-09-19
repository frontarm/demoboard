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
  input: 'src/index.ts',
  output: {
    format: 'umd',
    name: 'setupDemoboardRuntime',
    sourcemap: true,
    footer: `\n//# sourceURL=frontarm.com`,
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    typescript({
      abortOnError: env === 'production',
      module: 'ESNext',
    })
  ],
}

if (env === 'production') {
  config.plugins.push(
    terser()
  )
}

export default config