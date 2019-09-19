import { TransformError } from '../../build/DemoboardBuildErrors'
import { Transpiler, TranspiledModule } from '../DemoboardWorkerTypes'
import postcss from 'postcss'
import postcssModules from 'postcss-modules'

export const transpile: Transpiler = async function transpileCSSModule({
  css,
  originalCode,
  filename,
}: TranspiledModule): Promise<TranspiledModule> {
  let jsonString = '{}'
  let plugins = [
    postcssModules({
      getJSON: function(cssFileName, json, outputFileName) {
        jsonString = JSON.stringify(json)
      },
    }),
  ]

  try {
    let result = await postcss(plugins).process(css)

    return {
      code: `module.exports = ` + jsonString,
      originalCode: originalCode,
      map: result.map,
      filename,
      dependencies: [],
      prettyCode: '',
      css: result.css,
    }
  } catch (error) {
    throw new TransformError({
      sourceFile: filename,
      message: error.message,
    })
  }
}
