import { transform } from '@babel/standalone'
import { TransformError } from '../../build/DemoboardBuildErrors'
import detectivePlugin from './babel-plugin-detective'
import dynamicImportPlugin from 'babel-plugin-dynamic-import-node'
import styledComponentsPlugin from 'babel-plugin-styled-components'
import preventInfiniteLoopsPlugin from './babel-plugin-prevent-infinite-loops'
import { Transpiler, TranspiledModule } from '../DemoboardWorkerTypes'
const prettier = require('prettier/standalone')
const parserBabylon = require('prettier/parser-babylon')

export const transpile: Transpiler = async function demoboardBabelTransform({
  code,
  filename,
}: TranspiledModule): Promise<TranspiledModule> {
  let transformed

  try {
    const babelOutput = transform(code, {
      filename: filename,

      presets: ['es2015', 'es2016', 'es2017', 'react', 'stage-3'],
      plugins: [
        'syntax-object-rest-spread',
        'proposal-object-rest-spread',
        preventInfiniteLoopsPlugin,
        dynamicImportPlugin,
        [
          styledComponentsPlugin,
          {
            // Don't attempt to make use of the filesystem
            fileName: false,
            ssr: false,
            cssProp: true,
          },
        ],
        detectivePlugin,
      ],

      // This keeps comments on the correct line
      retainLines: true,

      sourceMaps: true,
      sourceType: 'module',
    })

    return {
      code: babelOutput.code,
      originalCode: code,
      map: babelOutput.map,
      filename,
      dependencies: babelOutput.metadata.requires || [],
      prettyCode: prettier.format(
        babelOutput.code.replace(/^("|')use strict("|');?\s*/, ''),
        {
          parser: 'babel',
          plugins: [parserBabylon],
          printWidth: 60,
          semi: false,
        },
      ),
    }
  } catch (e) {
    console.error(e)

    const positionMatch = e.message.match(/\((\d+):(\d+)\)/)

    throw new TransformError({
      sourceFile: filename,
      message: e.message,
      lineNumber: positionMatch && positionMatch[1],
      charNumber: positionMatch && positionMatch[2],
    })
  }
}
