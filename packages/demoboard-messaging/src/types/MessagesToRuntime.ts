import { FetchResult } from 'polestar'

export type MessagesToRuntime = {
  'pop-state': {
    location: any,
    state: any,
    length: any,
  },

  'module': FetchResult,

  'module-failure': {
    url: string,
    error: Error,
  }
}