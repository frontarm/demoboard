import { DemoboardTranspiledModule } from './DemoboardTranspiledModule'

export interface DemoboardWorkerBuildResult {
  transformedSources: {
    [name: string]: string
  }
  transpiledModules: {
    [name: string]: DemoboardTranspiledModule
  }
  shouldRegenerateHTML?: boolean
  error?: any
}
