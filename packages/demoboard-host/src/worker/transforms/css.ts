import { Transpiler, TranspiledModule } from '../DemoboardWorkerTypes'

export const transpile: Transpiler = async function transpileCSS({
  code,
  filename,
}: TranspiledModule): Promise<TranspiledModule> {
  return {
    code: 'module.exports = {}',
    originalCode: code,
    filename,
    dependencies: [],
    prettyCode: code,
    css: code,
  }
}
