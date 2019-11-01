/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import MagicString from 'magic-string'
import path from 'path'
import commonjs from 'rollup-plugin-commonjs'
import nodeBuiltins from 'rollup-plugin-node-builtins'
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
  // 'sass'
]

const transformsObjectLines = ['{']
transformNames.forEach(name => {
  transformsObjectLines.push(`  ${name}: () => import('./${name}'),`)
})
transformsObjectLines.push('}')

const indexPlugins = [
  replace({
    'process.env.TRANSFORMS': transformsObjectLines.join('\n'),
    'process.env.TRANSFORM_NAMES': JSON.stringify(transformNames),
  }),
  {
    // Externalize the transforms
    resolveId(source, importer) {
      if (
        importer === path.resolve(__dirname, 'src/transforms/index.ts') &&
        source[0] === '.'
      ) {
        return {
          id: './transforms/' + source.split('/')[1] + '.js',
          external: true,
        }
      }
      return null
    },
  },
]

const commonPlugins = [
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
    clean: true, // required due to objectHashIgnoreUnknownHack
    module: 'ESNext',
    objectHashIgnoreUnknownHack: true,
    useTsconfigDeclarationDir: true,
  }),
]

if (env === 'production') {
  commonPlugins.push(terser())
}

function makeConfig({
  name,
  prependPlugins = [],
  appendModules: appendPlugins = [],
}) {
  const input = 'src' + (name ? '/transforms/' + name + '' : '') + '/index.ts'
  const file = (name ? '/transforms/' + name : '/index') + '.js'
  const umdName = 'demoboard-worker' + (name ? '-transform-' + name : '')
  return {
    input,
    output: [
      {
        file: 'dist/es' + file,
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/umd' + file,
        format: 'umd',
        name: umdName,
        sourcemap: true,
      },
    ],
    plugins: prependPlugins.concat(commonPlugins).concat(appendPlugins),
  }
}

const importPattern = /\simport\(/g

export default [
  makeConfig({
    prependPlugins: indexPlugins,
    appendModules: [
      {
        renderChunk(code, chunk, outputOptions) {
          if (outputOptions.format === 'umd' && chunk.dynamicImports.length) {
            const magicString = new MagicString(code)

            let match
            let start
            let end

            // eslint-disable-next-line no-cond-assign
            while ((match = importPattern.exec(code))) {
              start = match.index
              end = start + match[0].length
              magicString.overwrite(start, end, ' self.lazyRequire(')
            }

            return {
              code: magicString.toString(),
              map: magicString.generateMap({ hires: true }),
            }
          }
          return null
        },
      },
    ],
  }),
].concat(transformNames.map(name => makeConfig({ name })))
