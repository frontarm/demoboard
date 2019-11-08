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

const replaceReadableStream = replace({
  delimiters: ['', ''],
  values: {
    // Get around circular dependency issues caused by readable-stream
    "require('readable-stream/duplex')": 'require("stream").Duplex',
    'require("readable-stream/duplex")': 'require("stream").Duplex',
    "require('readable-stream/passthrough')": 'require("stream").PassThrough',
    'require("readable-stream/passthrough")': 'require("stream").PassThrough',
    "require('readable-stream/readable')": 'require("stream").Readable',
    'require("readable-stream/readable")': 'require("stream").Readable',
    "require('readable-stream/transform')": 'require("stream").Transform',
    'require("readable-stream/transform")': 'require("stream").Transform',
    "require('readable-stream/writable')": 'require("stream").Writable',
    'require("readable-stream/writable")': 'require("stream").Writable',
    "require('readable-stream')": 'require("stream")',
    'require("readable-stream")': 'require("stream")',
  },
})
const builtinsPlugin = nodeBuiltins()
const resolvePlugin = nodeResolve({
  mainFields: ['module', 'main', 'jsnext:main'],
})
const commonJSPlugin = commonjs({
  ignore: [
    'codemirror',
    'codemirror/addon/runmode/runmode.js',
    'codemirror/addon/runmode/runmode.node.js',
    'codemirror/mode/meta',
    'codemirror/mode/jsx/jsx',
    'codemirror/mode/css/css',
    'codemirror/mode/markdown/markdown',
    'codemirror/mode/htmlmixed/htmlmixed',
  ],
  namedExports: {
    automerge: ['applyChanges', 'change', 'from', 'Proxy', 'Text'],
  },
})
const jsonPlugin = json()
const typeScriptPlugin = typescript({
  abortOnError: env === 'production',
  clean: true, // required due to objectHashIgnoreUnknownHack
  module: 'ESNext',
  objectHashIgnoreUnknownHack: true,
  typescript: require('typescript'),
  useTsconfigDeclarationDir: true,
})
const terserPlugin = terser({
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
    CODEMIRROR_IMPORT_METHOD: isUMD ? 'import' : 'conditional',
  }

  return [
    replace(replacements),
    builtinsPlugin,
    resolvePlugin,
    replaceReadableStream,
    commonJSPlugin,
    jsonPlugin,
    typeScriptPlugin,
    env === 'production' && terserPlugin,
  ].filter(Boolean)
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
        'styled-components': 'styled',
      },
    },
    inlineDynamicImports: true,
    external: ['react', 'react-dom', 'react-is', 'styled-components'],
    plugins: getPlugins(true),
  },
]
