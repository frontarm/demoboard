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
import url from 'rollup-plugin-url'

const filesToExtract = [/sass\.worker\.js$/]

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
      (/^\w/.test(id) || id[0] === '@') &&
      !filesToExtract.some(pattern => pattern.test(id))
    ) {
      return true
    }
  },

  plugins: [
    nodeBuiltins(),
    nodeResolve({
      mainFields: ['module', 'main', 'jsnext:main'],
    }),
    url({
      limit: 10 * 1024, // inline files < 10k, copy files > 10k
      include: filesToExtract,
    }),
    commonjs(),
    typescript({
      abortOnError: env === 'production',
      clean: true, // required due to objectHashIgnoreUnknownHack
      module: 'ESNext',
      objectHashIgnoreUnknownHack: true,
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
