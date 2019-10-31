/**
 * Copyright (c) 2015-present Dan Abramov
 * This is based on the rollup config from Redux
 */

import commonjs from 'rollup-plugin-commonjs'
import nodeBuiltins from 'rollup-plugin-node-builtins'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import createStyledComponentsTransformer from 'typescript-plugin-styled-components'

const CSSPattern = /\.css$/

function cssToString(opts = {}) {
  return {
    name: 'cssToString',
    transform(code, id) {
      if (CSSPattern.test(id)) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: { mappings: '' },
        }
      }
    },
  }
}

const styledComponentsTransformer = createStyledComponentsTransformer()

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
    if ((/^\w/.test(id) || id[0] === '@') && !CSSPattern.test(id)) {
      return true
    }
  },

  plugins: [
    nodeBuiltins(),
    nodeResolve({
      mainFields: ['module', 'main', 'jsnext:main'],
    }),
    cssToString(),
    commonjs(),
    replace({
      // Don't set the env unless building for production, as it will cause
      // rollup to shake out the minified runtime.
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    typescript({
      abortOnError: false,
      module: 'ESNext',
      getCustomTransformers: () => ({ before: [styledComponentsTransformer] }),
    }),
  ],
}

if (env === 'production') {
  config.plugins.push(terser())
}

export default config
