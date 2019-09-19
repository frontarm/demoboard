import { TransformError } from '../../build/DemoboardBuildErrors'
import { Transpiler, TranspiledModule } from '../DemoboardWorkerTypes'

const sassWorker = require('!file-loader!sass.js/dist/sass.worker.js')

let sass

export const transpile: Transpiler = async function transpileSass({
  code,
  filename,
}: TranspiledModule): Promise<TranspiledModule> {
  const { default: Sass } = await import('sass.js/dist/sass.js')

  if (!sass) {
    sass = new Sass(sassWorker)
  }

  return await new Promise<TranspiledModule>((resolve, reject) => {
    sass.compile(code, result => {
      if (result.status === 1) {
        reject(
          new TransformError({
            sourceFile: filename,
            message: result.message,
            lineNumber: result.line,
          }),
        )
      } else {
        resolve({
          code: 'module.exports = {}',
          originalCode: code,
          map: result.map,
          filename,
          dependencies: [],
          prettyCode: result.text,
          css: result.text,
        })
      }
    })
  })
}
