import { DemoboardProjectState } from './DemoboardProject'
import { DemoboardBuild } from './DemoboardBuild'

export type DemoboardExporter = (options: {
  build: DemoboardBuild
  project: DemoboardProjectState
}) => Promise<Blob>
