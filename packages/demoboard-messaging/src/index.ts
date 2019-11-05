import { expose, wrap, Endpoint } from 'comlink'
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
  const destination = window.parent

  const worker = wrap(
    createEndpoint({
      destination,
      wrap: message => ({
        type: HostNamespace + 'worker',
        payload: message,
        id,
        version,
      }),
      unwrap: message => {
        if (message.type === RuntimeNamespace + 'worker' && message.id === id) {
          return message.payload
        }
      },
    }),
  )

  return Object.assign(
    createSeriesOfTubes<MessagesToRuntime, MessagesToHost>({
      id,
      version,
      destination,
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
            let dispatchConsoleItem = () =>
              tubes.dispatch('console-item', value)
            promises[i].then(dispatchConsoleItem, dispatchConsoleItem)
          }
          return result.json
        },
      },
      decode: {
        'module-failure': decode,
      },
    }),
    { worker },
  )
}

interface CreateEndpointOptions {
  destination: Window
  wrap: (message: any) => any
  unwrap: (message: any) => any
}

function createEndpoint({
  destination,
  wrap,
  unwrap,
}: CreateEndpointOptions): Endpoint {
  const listeners = new WeakMap()

  return {
    addEventListener: (type, listener, options) => {
      const wrappedListener = (event: MessageEvent) => {
        const unwrappedMessage = event && event.data && unwrap(event.data)
        if (unwrappedMessage) {
          ;(listener as Function)({ data: unwrappedMessage })
        }
      }
      listeners.set(listener, wrappedListener)
      window.addEventListener(type, wrappedListener, options)
    },
    removeEventListener: (type, listener, options) => {
      const wrappedListener = listeners.get(listener)
      if (wrappedListener) {
        window.removeEventListener(type, wrappedListener, options)
      }
    },
    postMessage: (message, transferables) => {
      destination.postMessage(wrap(message), '*', transferables)
    },
  }
}

export function createRuntime(
  id: string,
  iframe: HTMLIFrameElement,
  worker: any,
) {
  const destination = iframe.contentWindow

  // Comlink runs into issues when `worker` is already a comlink proxy,
  // so the proxy needs to be wrapped like so. I want there to be a better
  // way.
  const workerWrapper = {
    build: (options: any) => worker.build(options),
    clearBuildCache: (id: any) => worker.clearBuildCache(id),
    fetchDependency: (options: any) => worker.fetchDependency(options),
  }

  expose(
    workerWrapper,
    createEndpoint({
      destination,
      wrap: message => ({
        type: RuntimeNamespace + 'worker',
        payload: message,
        id,
      }),
      unwrap: message => {
        if (message.type === HostNamespace + 'worker' && message.id === id) {
          return message.payload
        }
      },
    }),
  )

  return Object.assign(
    createSeriesOfTubes<MessagesToHost, MessagesToRuntime>({
      id,
      destination,
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
        destination.postMessage(
          {
            type: ContainerNamespace + 'set-srcdoc',
            id,
            srcdoc,
          },
          '*',
        )
      },
      init: () => {
        destination.postMessage(
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
