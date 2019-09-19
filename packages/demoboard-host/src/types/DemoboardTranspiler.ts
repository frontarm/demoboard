import { DemoboardTranspiledModule } from './DemoboardTranspiledModule'

export type DemoboardTranspiler = (
  input: DemoboardTranspiledModule,
) => Promise<DemoboardTranspiledModule>
