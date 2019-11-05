import 'regenerator-runtime/runtime.js'
import { Polestar, FetchResult } from 'polestar'
import { createHost } from '@frontarm/demoboard-messaging'
import { captureAnchorClicks } from './captureAnchorClicks'
import { captureConsole } from './captureConsole'
import { captureErrors } from './captureErrors'
import { createWindowWithStubbedNavigation } from './createWindowWithStubbedNavigation'

export default function setupDemoboardRuntime(
  id: string,
  initialLocation: any,
  version: number,
  env: object = {},
) {
  let host = createHost(id, version)

  captureAnchorClicks(host)
  captureConsole(window.console, host)
  captureErrors(host)

  let process = { env }
  let demoboard = {
    id,
    runtime: this,
    worker: host.worker,
  }
  let windowWithStubbedNavigation = createWindowWithStubbedNavigation(
    host,
    window,
    initialLocation,
  )
  let globals = {
    demoboard,
    window: windowWithStubbedNavigation,
    history: windowWithStubbedNavigation.history,
    location: windowWithStubbedNavigation.location,
    global: windowWithStubbedNavigation,
    process,
  }
  ;(window as any).demoboard = demoboard
  ;(window as any).process = process

  let loadingModules = {} as {
    [url: string]: [(result: FetchResult) => void, (error) => void]
  }
  let loadError = null

  host.subscribeTo('module', payload => {
    let url = payload.url
    if (loadingModules[url]) {
      loadingModules[url][0](payload)
      delete loadingModules[url]
    }
  })
  host.subscribeTo('module-failure', payload => {
    let url = payload.url
    if (loadingModules[url]) {
      loadError = payload.error
      loadingModules[url][1](payload.error)
      delete loadingModules[url]
    }
  })

  let polestar = new Polestar({
    globals,
    moduleThis: windowWithStubbedNavigation,
    fetcher: (url: string, meta) =>
      new Promise<FetchResult>((resolve, reject) => {
        host.dispatch('module-required', {
          url: url,
          requiredById: meta.requiredById,
          originalRequest: meta.originalRequest,
        })
        loadingModules[url] = [resolve, reject]
      }),
    onEntry: () => {
      host.dispatch('init', {})
    },
    onError: error => {
      if (error !== loadError) {
        window.console['native'].error(error)
        host.dispatch('error', error)
      }
    },
  })

  return {
    ...globals,
    evaluate: polestar.evaluate.bind(polestar),
    require: polestar.require.bind(polestar),
    host,
  }
}
