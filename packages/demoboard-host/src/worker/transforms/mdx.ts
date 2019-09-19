import { transform } from '@babel/standalone'
import { TransformError } from '../../build/DemoboardBuildErrors'
import babelPluginDetective from './babel-plugin-detective'
import { Transpiler, TranspiledModule } from '../DemoboardWorkerTypes'
const prettier = require('prettier/standalone')
const parserBabylon = require('prettier/parser-babylon')

export const transpile: Transpiler = async function transpileMDX({
  code,
  filename,
}: TranspiledModule): Promise<TranspiledModule> {
  const { transformMDX } = await import('./transformMDX')

  try {
    const jsx = transformMDX(code)

    let originalReactImport = code.match(
      /import\s+React\s+from (?:'|")react(@.*)?(?:'|")/,
    )
    let imports = `import { MDXTag } from '@mdx-js/tag'\n`
    if (!originalReactImport) {
      imports += `import React from 'react'\n`
    }

    const babelOutput = transform(imports + jsx, {
      filename,

      presets: ['es2015', 'react'],
      plugins: [
        'syntax-object-rest-spread',
        'proposal-object-rest-spread',
        babelPluginDetective,
      ],

      compact: false,
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
    const positionMatch = e.message.match(/\((\d+):(\d+)\)/)

    throw new TransformError({
      sourceFile: filename,
      message: e.message,
      lineNumber: positionMatch && positionMatch[1],
      charNumber: positionMatch && positionMatch[2],
    })
  }
}
