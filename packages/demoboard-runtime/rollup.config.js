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

const { version } = require('./package.json')

const env = process.env.NODE_ENV
const config = {
  input: 'src/index.ts',
  output: {
    format: 'umd',
    name: 'setupDemoboardRuntime',
    sourcemap: true,
    footer: `\n//# sourceURL=frontarm.com`,
  },
  onwarn: function(warning) {
    // Suppress warning caused by TypeScript classes using "this"
    // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return
    }
    console.error(warning.message)
  },
  plugins: [
    nodeBuiltins(),
    nodeResolve({
      mainFields: ['module', 'main', 'jsnext:main'],
    }),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    typescript({
      abortOnError: env === 'production',
      module: 'ESNext',
    }),
  ],
}

if (env === 'production') {
  config.plugins.push(terser())
}

export default config
