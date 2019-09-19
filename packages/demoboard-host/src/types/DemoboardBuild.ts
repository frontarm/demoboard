import { DemoboardTranspiledModule } from './DemoboardTranspiledModule'

export type DemoboardBuildStatus = 'busy' | 'error' | 'success'

export interface DemoboardBuild {
  entryPathname: string

  /**
   * Specify packages/modules that should be mocked with other packages/modules.
   */
  mocks: { [module: string]: string }

  sources: { [pathname: string]: string }
  version: number

  status: DemoboardBuildStatus

  /**
   * Indicates that newer build config is available, but it hasn't been built
   * as the build is currently paused.
   */
  stale: boolean

  error?: any
  result?: {
    html: string
    transpiledModules: {
      [name: string]: DemoboardTranspiledModule
    }
  }
}
