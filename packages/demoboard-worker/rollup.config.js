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

const umd = process.env.UMD || 'include'
if (!['only', 'exclude', 'include'].includes(umd)) {
  console.error(`Unknown UMD option "${umd}"`)
  process.exit(1)
}

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
const esmGetTransformImportersReplace = getTransformImportersReplace(
  name => `() => import('./${name}')`,
)

// In UMD build, we can't pack the transforms separately so we'll load
// them from UNPKG at runtime instead. We include `require` as a fallback,
// in case the UMD package is loaded in a node environment.
const umdGetTransformImportersReplace = getTransformImportersReplace(
  name =>
    `typeof require === 'undefined' ? undefined : () => Promise.resolve().then(() => require('./transforms/${name}'))`,
)

// In UMD build, we can't pack the transforms separately so we'll load
// them from UNPKG at runtime instead.
const cjsGetTransformImportersReplace = getTransformImportersReplace(
  name => `() => Promise.resolve().then(() => require('./transforms/${name}'))`,
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

const builtinsPlugin = nodeBuiltins()
const resolvePlugin = nodeResolve({
  mainFields: ['module', 'main', 'jsnext:main'],
})
const commonJSPlugin = commonjs({
  namedExports: {
    '@babel/standalone': ['transform'],
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

function getCommonPlugins(isUMD) {
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

// If we're not building a UMD bundle, then dependencies can be imported
// external modules -- which generally results in better build and load
// performance.
const external = id => {
  if (/^\w/.test(id) || id[0] === '@') {
    return true
  }
}

function fromEntries(entries) {
  const obj = {}
  entries.forEach(([key, value]) => {
    obj[key] = value
  })
  return obj
}

const configs = []

if (umd !== 'only') {
  configs.push(
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/es/index.js',
        format: 'esm',
        sourcemap: true,
      },
      external,
      plugins: [
        esmGetTransformImportersReplace,
        externalizeTransformImporters,
      ].concat(getCommonPlugins(false)),
    },
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/commonjs/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      external,
      plugins: [
        cjsGetTransformImportersReplace,
        externalizeTransformImporters,
      ].concat(getCommonPlugins(false)),
    },
    {
      input: fromEntries(
        transformNames.map(name => [name, `src/transforms/${name}/index.ts`]),
      ),
      output: [
        {
          dir: 'dist/es/transforms',
          format: 'esm',
          sourcemap: true,
        },
        {
          dir: 'dist/commonjs/transforms',
          format: 'cjs',
          sourcemap: true,
        },
      ],
      external,
      plugins: getCommonPlugins(false),
    },
  )
}

if (umd !== 'exclude') {
  configs.push(
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/umd/index.js',
        format: 'umd',
        name: 'DemoboardWorker',
        sourcemap: true,
      },
      plugins: [
        umdGetTransformImportersReplace,
        externalizeTransformImporters,
      ].concat(getCommonPlugins(true)),
    },
    // Each transform needs a separate self-contained bundle for the UMD build
    ...transformNames.map(name => ({
      input: `src/transforms/${name}/index.ts`,
      output: {
        file: `dist/umd/transforms/${name}.js`,
        format: 'umd',
        globals: {
          '@babel/core': 'Babel',
        },
        name:
          'DemoboardWorkerTransform' + name[0].toUpperCase() + name.slice(1),
        sourcemap: false,
      },
      external: ['@babel/core'],
      plugins: getCommonPlugins(true),
    })),
  )
}

export default configs
