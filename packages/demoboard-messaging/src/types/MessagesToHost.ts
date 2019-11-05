import { ConsoleItem } from './ConsoleItem'

export type MessagesToHost = {
  'container-ready': {}

  init: {}

  error: Error

  'console-item': ConsoleItem

  navigate: {
    url: string
  }

  'update-history-state': {
    operation: 'pushState' | 'replaceState'
    state: any
    title?: string | null
    location: any
  }

  'module-required': {
    url: string
    requiredById: string
    originalRequest: string
  }
}
