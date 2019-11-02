import { createSeriesOfTubes, SeriesOfTubes } from './SeriesOfTubes'
import { MessagesToHost } from './types/MessagesToHost'
import { MessagesToRuntime } from './types/MessagesToRuntime'
import { encode, encodeWithPromises, decode } from './replicator'

export type Host = SeriesOfTubes<MessagesToRuntime, MessagesToHost>
export interface Runtime
  extends SeriesOfTubes<MessagesToHost, MessagesToRuntime> {
  setSource: (srcdoc) => void
  init: () => void
}

export const HostNamespace = 'demoboard-host/'
export const RuntimeNamespace = 'demoboard-runtime/'
export const ContainerNamespace = 'demoboard-container/'

export function createHost(id: string, version: number) {
  return createSeriesOfTubes<MessagesToRuntime, MessagesToHost>({
    id,
    version,
    destination: window.parent,
    inNamespace: RuntimeNamespace,
    outNamespace: HostNamespace,
    encode: {
      error: encode,

      // If there are any promises, send out new messages with the outcomes
      // once the promises settle.
      'console-item': (value, tubes) => {
        let result = encodeWithPromises(value)
        let promises = result.promises
        for (let i = 0; i < promises.length; i++) {
          let dispatchConsoleItem = () => tubes.dispatch('console-item', value)
          promises[i].then(dispatchConsoleItem, dispatchConsoleItem)
        }
        return result.json
      },
    },
    decode: {
      'module-failure': decode,
    },
  })
}

export function createRuntime(id: string, iframe: HTMLIFrameElement) {
  return Object.assign(
    createSeriesOfTubes<MessagesToHost, MessagesToRuntime>({
      id,
      destination: iframe.contentWindow,
      inNamespace: HostNamespace,
      outNamespace: RuntimeNamespace,
      decode: {
        error: decode,
        'console-item': decode,
      },
      encode: {
        'module-failure': encode,
      },
    }),
    {
      setSource: srcdoc => {
        iframe.contentWindow.postMessage(
          {
            type: ContainerNamespace + 'set-srcdoc',
            id,
            srcdoc,
          },
          '*',
        )
      },
      init: () => {
        iframe.contentWindow.postMessage(
          {
            type: ContainerNamespace + 'init',
            id,
          },
          '*',
        )
      },
    },
  )
}

export * from './types/ConsoleItem'
export * from './types/MessagesToHost'
export * from './types/MessagesToRuntime'
