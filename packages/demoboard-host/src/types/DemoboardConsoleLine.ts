import { ConsoleItem } from '@frontarm/demoboard-messaging'

export type DemoboardConsoleLine =
  | {
      source: 'console-item'
      item: ConsoleItem
    }
  | {
      source: 'error'
      error: Error
    }
