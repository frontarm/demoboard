import * as React from 'react'
import { DemoboardExporter, DemoboardGenerator } from './types'

export interface DemoboardContext {
  exporters: {
    [name: string]: DemoboardExporter
  }
  generators: {
    [name: string]: DemoboardGenerator
  }
}

// TODO: add sane defaults
export const DemoboardContext = React.createContext<DemoboardContext>({
  exporters: {},
  generators: {},
})
