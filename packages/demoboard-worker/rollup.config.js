/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import path from 'path'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeBuiltins from 'rollup-plugin-node-builtins'
import nodeGlobals from 'rollup-plugin-node-globals'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

const env = process.env.NODE_ENV
const transformNames = [
  'babel',
  'css',
  'cssModule',
  'mdx',
  // 'sass' // TODO: fix SASS support back
]

function createGetTransformImporters(createImport) {
  const lines = ['function getTransformImporters(wrap) {\n  return {']
  transformNames.forEach(name => {
    lines.push(`    ${name}: wrap('${name}', ${createImport(name)}),`)
  })
  lines.push('  }\n}')
  return lines.join('\n')
}

function getTransformImportersReplace(createImport) {
  return replace({
    GET_TRANSFORM_IMPORTERS: createGetTransformImporters(createImport),
  })
}

// In ES6/CommonJS builds, transforms can be imported/required.
const esGetTransformImportersReplace = getTransformImportersReplace(
  name => `() => import('./${name}')`,
)

// In IIFE build, we can't pack the transforms separately so we'll load
// them from UNPKG at runtime instead.
const umdGetTransformImportersReplace = getTransformImportersReplace(
  name =>
    `typeof require === 'undefined' ? undefined : () => Promise.resolve().then(() => require('./${name}'))`,
)

const externalizeTransformImporters = {
  // Externalize the transforms
  resolveId(source, importer) {
    if (
      importer ===
        path.resolve(__dirname, 'src/transforms/getTransformImporters.js') &&
      source[0] === '.'
    ) {
      return {
        id: './transforms/' + source.split('/')[1] + '.js',
        external: true,
      }
    }
    return null
  },
}

const commonPlugins = [
  nodeBuiltins(),
  nodeResolve({
    mainFields: ['module', 'main', 'jsnext:main'],
  }),
  commonjs({
    namedExports: {
      '@babel/standalone': ['transform'],
    },
  }),
  nodeGlobals(),
  json(),
  replace({
    'process.env.NODE_ENV': JSON.stringify(env),
  }),
  typescript({
    abortOnError: env === 'production',
    clean: true, // required due to objectHashIgnoreUnknownHack
    module: 'ESNext',
    objectHashIgnoreUnknownHack: true,
    useTsconfigDeclarationDir: true,
  }),
]

if (env === 'production') {
  commonPlugins.push(terser())
}

function makeConfig({ name, prependPlugins = [], output = undefined }) {
  const input = 'src' + (name ? '/transforms/' + name + '' : '') + '/index.ts'
  const file = (name ? '/transforms/' + name : '/index') + '.js'
  const umdName =
    'demoboardWorker' +
    (name ? 'Transform' + name[0].toUpperCase() + name.slice(1) : '')
  return {
    input,
    output: [
      (!output || output === 'esm') && {
        file: 'dist/es' + file,
        format: 'esm',
        sourcemap: true,
      },
      (!output || output === 'umd') && {
        file: 'dist/umd' + file,
        format: 'umd',
        name: umdName,
        sourcemap: true,
      },
    ].filter(Boolean),
    plugins: prependPlugins.concat(commonPlugins),
  }
}

export default [
  makeConfig({
    prependPlugins: [
      esGetTransformImportersReplace,
      externalizeTransformImporters,
    ],
    output: 'esm',
  }),
  makeConfig({
    prependPlugins: [
      umdGetTransformImportersReplace,
      externalizeTransformImporters,
    ],
    output: 'umd',
  }),
].concat(transformNames.map(name => makeConfig({ name })))
