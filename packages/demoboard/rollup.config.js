/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeBuiltins from 'rollup-plugin-node-builtins'
import nodeGlobals from 'rollup-plugin-node-globals'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

const env = process.env.NODE_ENV

const builtinsPlugin = nodeBuiltins()
const resolvePlugin = nodeResolve({
  mainFields: ['module', 'main', 'jsnext:main'],
})
const commonJSPlugin = commonjs({
  namedExports: {
    automerge: ['applyChanges', 'change', 'from', 'Proxy', 'Text'],
  },
})
const globalsPlugin = nodeGlobals()
const jsonPlugin = json()
const typeScriptPlugin = typescript({
  abortOnError: env === 'production',
  clean: true, // required due to objectHashIgnoreUnknownHack
  module: 'ESNext',
  objectHashIgnoreUnknownHack: true,
  typescript: require('typescript'),
  useTsconfigDeclarationDir: true,
})
const terserPlugin =
  env === 'production' &&
  terser({
    // Goddammit Safari.
    safari10: true,
    output: {
      ascii_only: true,
    },
  })

function getPlugins(isUMD) {
  const replacements = {
    'process.env.NODE_ENV': JSON.stringify(env),
    'process.env.UMD': JSON.stringify(isUMD),
  }

  return [
    builtinsPlugin,
    resolvePlugin,
    commonJSPlugin,
    isUMD && globalsPlugin,
    jsonPlugin,
    typeScriptPlugin,
    replace(replacements),
    terserPlugin,
  ].filter(Boolean)
}

if (env === 'production') {
  config.plugins.push(terser())
}

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/es',
        format: 'esm',
        sourcemap: true,
      },
      {
        dir: 'dist/commonjs',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    external(id) {
      if (/^\w/.test(id) || id[0] === '@') {
        return true
      }
    },
    plugins: getPlugins(false),
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/umd/demoboard.js',
      format: 'umd',
      name: 'Demoboard',
      sourcemap: true,
      globals: {
        react: 'React',
        'react-is': 'ReactIs',
        'react-dom': 'ReactDOM',
        'readable-stream': '{}',
      },
    },
    inlineDynamicImports: true,
    external: [
      'react',
      'react-dom',
      'react-is',

      // This introduces circular dependencies which cause the bundle to crash
      // on load. The app *seems* to work without it.
      'readable-stream',
    ],
    plugins: getPlugins(true),
  },
]
