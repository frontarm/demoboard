/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { FetchResult } from 'polestar'
import { useCallback, useContext, useEffect, useRef, useReducer } from 'react'
import { DemoboardWorkerContext } from '../DemoboardContext'
import {
  createRuntime,
  ConsoleItem,
  MessagesToHost,
  Runtime as DemoboardRuntime,
} from '@frontarm/demoboard-messaging'
import {
  DemoboardBuild,
  DemoboardConsoleLine,
  DemoboardHistory,
  DemoboardHistoryLocation,
  DemoboardInstance,
  DemoboardInstanceStatus,
} from '../types'
import {
  pushLocation,
  createHistoryLocation,
  getCurrentLocation,
  getLastRenderedLocation,
} from '../utils/history'
import { mapStackTrace } from '../utils/mapStackTrace'

export interface UseDemoboardInstanceOptions {
  // This will be null until the first build is triggered -- which may not ever
  // actually happen if the demoboard never becomes visible.
  build: DemoboardBuild | null

  history: DemoboardHistory
  pause: boolean
  onChangeHistory: (value: DemoboardHistory) => void
}

interface UseDemoboardInstanceState {
  error: any

  // Record the version that an error occured on, so we can ignore it if
  // the version has increased.
  errorContainerVersion: number | null

  // This is a map, as it allows us to overwrite previous console lines if
  // they're updated with the same id (e.g. for promise results.)
  consoleLines: Map<string, DemoboardConsoleLine>
}

interface UseDemoboardInstanceMutableState {
  // This stays null until the container is ready, or after something which
  // results in the iframe being unmounted
  container: null | {
    build: DemoboardBuild
    currentLocation: DemoboardHistoryLocation
    lastInitVersion: number | null
  }
  hasStarted: boolean
  latestContainerBuild: null | DemoboardBuild
  latestContainerVersion: number
  latestErrorContainerVersion: number | null
  status: DemoboardInstanceStatus
  latest: {
    build: DemoboardBuild | null
    currentLocation: DemoboardHistoryLocation
    history: DemoboardHistory
    onChangeHistory: (value: DemoboardHistory) => void
    renderedLocation: DemoboardHistoryLocation
  }
  nextConsoleErrorId: number
  runtime: null | DemoboardRuntime
}

export function useDemoboardInstance(
  options: UseDemoboardInstanceOptions,
): DemoboardInstance {
  const { worker } = useContext(DemoboardWorkerContext)

  let { build, history, pause, onChangeHistory } = options
  const { containerURL, id } = build || {}

  // The rendered location represents the location of the entry point, which
  // may be different to the "current" location if push state was used after
  // the rendered location was mounted.
  let renderedLocation = getLastRenderedLocation(history)
  let currentLocation = getCurrentLocation(history)

  let { current: mutableState } = useRef<UseDemoboardInstanceMutableState>({
    container: null,
    hasStarted: !pause,
    latestContainerVersion: 0,
    latestContainerBuild: null,
    latestErrorContainerVersion: null,
    latest: {
      build,
      currentLocation,
      history,
      onChangeHistory,
      renderedLocation,
    },
    nextConsoleErrorId: 1,
    runtime: null,
    status: undefined as any,
  })

  let previousRenderedLocation =
    mutableState.latest && mutableState.latest.renderedLocation

  mutableState.latest = {
    build,
    currentLocation,
    history,
    onChangeHistory,
    renderedLocation,
  }

  // Once we unpause the instance for the first time, we'll keep it running
  // until the iframe disappears for whatever reason.
  mutableState.hasStarted =
    !pause || !!(mutableState.container && mutableState.hasStarted)

  let [state, dispatch] = useReducer(
    demoboardInstanceReducer,
    options,
    demoboardInstanceInit,
  )

  mutableState.latestErrorContainerVersion = state.errorContainerVersion

  // If we've got a working container and a new build, then immediately send
  // a message with the new source and update the container details in state.
  //
  // There's no need to do anything here if the build has become empty, as the
  // instance component will remove the iframe.
  if (
    mutableState.hasStarted &&
    mutableState.runtime &&
    mutableState.container &&
    ((build &&
      build.status === 'success' &&
      !build.stale &&
      mutableState.container.build !== build) ||
      previousRenderedLocation !== renderedLocation)
  ) {
    updateContainer(mutableState)
  }

  if (
    mutableState.status === 'error' &&
    mutableState.latestContainerBuild !== build
  ) {
    mutableState.latestContainerVersion++
  }

  mutableState.status = computeStatus(mutableState)

  // If the instance's current location has changed for any reason, we'll need
  // to let it know of the new location.
  useEffect(() => {
    if (
      mutableState.status === 'active' &&
      currentLocation.popState &&
      mutableState.runtime &&
      mutableState.container &&
      mutableState.container.currentLocation !== currentLocation
    ) {
      let {
        uri: href,
        pathname,
        search,
        hash,
        stringifiedState,
      } = currentLocation

      mutableState.container.currentLocation = currentLocation
      mutableState.runtime.dispatch('pop-state', {
        location: {
          pathname,
          search,
          hash,
          href,
        },
        state: stringifiedState ? JSON.parse(stringifiedState) : null,
        length: 1, // FIXME
      })
    }
  })

  let iframeRef = useCallback(
    (element: HTMLIFrameElement | null) => {
      if (element) {
        element.src = containerURL! + '#' + id
      }

      let handleMessage = async (
        message: {
          [T in keyof MessagesToHost]: {
            type: T
            payload: MessagesToHost[T]
            id: string
            containerId?: string
            version?: number
          }
        }[keyof MessagesToHost],
      ) => {
        let runtime = mutableState.runtime
        if (!runtime) {
          return
        }

        // Sent once when the container is ready to started accepting messages.
        // Note that this may happen multiple times, as DemoboardInstanceIFrame
        // removes the iframe when there's no HTML available. It doens't have a
        // version, and it probably will be called while container is null, so
        // it needs to be handled separately front.
        if (message.type === 'container-ready') {
          updateContainer(mutableState)

          // Force a re-render
          dispatch({
            type: 'reload',
          })
          return
        }

        let version = mutableState.latestContainerVersion
        let transformedModules =
          mutableState.latestContainerBuild &&
          mutableState.latestContainerBuild.transformedModules
        let container = mutableState.container
        if (!container || message.version !== version) {
          return
        }

        let { build, history, onChangeHistory } = mutableState.latest

        switch (message.type) {
          // Note: this won't always be called immediately, as the demoboard
          // usually won't be built until the iframe enters the viewport for the
          // first time
          case 'init':
            // Let the container know that it can reset the scroll position
            runtime.init()

            // Record that the container is now active
            container.lastInitVersion = version

            // Update state and trigger a re-render
            dispatch({
              type: 'receive-init',
            })
            break

          case 'console-item':
            dispatch({
              type: 'receive-console-item',
              item: message.payload,
            })
            break

          case 'error':
            let error = message.payload
            if (transformedModules && error && error.stack) {
              error.stack = await mapStackTrace(error.stack, transformedModules)
            }
            dispatch({
              type: 'receive-error',
              error,
              containerVersion: version,
              status: mutableState.status,
              id: String(mutableState.nextConsoleErrorId++),
            })
            break

          case 'module-required':
            worker
              .fetchDependency({
                ...message.payload,
                dependencies: (build && build.config.dependencies) || {},
                mocks: (build && build.config.mocks) || {},
                transformedModules: transformedModules || {},
              })
              .then(payload => {
                let runtime = mutableState.runtime
                if (
                  !runtime ||
                  !mutableState.container ||
                  mutableState.latestContainerVersion !== version
                ) {
                  return
                }
                runtime.dispatch('module', payload as FetchResult)
              })
              .catch(error => {
                let runtime = mutableState.runtime
                if (
                  !runtime ||
                  !mutableState.container ||
                  mutableState.latestContainerVersion !== version
                ) {
                  return
                }
                runtime.dispatch('module-failure', {
                  url: message.payload.url,
                  error,
                })
                dispatch({
                  type: 'error-loading-module',
                  error,
                  containerVersion: version,
                })
              })
            break

          case 'update-history-state':
            let { location, state } = message.payload
            let url = [location.pathname, location.search, location.hash].join(
              '',
            )
            onChangeHistory(
              pushLocation(
                history,
                createHistoryLocation(url, true, JSON.stringify(state)),
              ),
            )
            break

          case 'navigate':
            onChangeHistory(
              pushLocation(
                history,
                createHistoryLocation(message.payload.url, false),
              ),
            )
            break
        }
      }

      if (mutableState.runtime) {
        mutableState.runtime.dispose()
        mutableState.runtime = null
        mutableState.container = null
      }
      if (element) {
        mutableState.runtime = createRuntime(
          mutableState.latest.build!.id,
          element,
          worker,
        )

        mutableState.runtime.subscribe(handleMessage)
      }

      if (mutableState.status !== computeStatus(mutableState)) {
        dispatch({
          type: 'reload',
        })
      }
    },
    [containerURL, id, mutableState, worker],
  )

  return {
    consoleLines: state.consoleLines,
    error: mutableState.status === 'error' ? state.error : undefined,
    location: currentLocation,
    ref: iframeRef,
    status: mutableState.status,
  }
}

type DemoboardInstanceAction =
  | { type: 'error-loading-module'; error: any; containerVersion: number }
  | { type: 'receive-init' }
  | { type: 'receive-console-item'; item: ConsoleItem }
  | {
      type: 'receive-error'
      error: any
      id: string
      containerVersion: number
      status: DemoboardInstanceStatus
    }
  | { type: 'reload' }

function demoboardInstanceReducer(
  state: UseDemoboardInstanceState,
  action: DemoboardInstanceAction,
): UseDemoboardInstanceState {
  switch (action.type) {
    case 'error-loading-module':
      return {
        ...state,
        error: action.error,
        errorContainerVersion: action.containerVersion,
      }

    case 'receive-init':
      return {
        ...state,
        error: null,
        errorContainerVersion: null,
        consoleLines: new Map(),
      }

    case 'receive-console-item':
      return {
        ...state,
        consoleLines: state.consoleLines.set(action.item.id, {
          source: 'console-item',
          item: action.item,
        }),
      }

    case 'receive-error':
      let resultWithError = {
        ...state,
        consoleLines: state.consoleLines.set(action.id, {
          source: 'error',
          error: action.error,
        }),
      }

      // If an error occurs before initialization completes,
      // set the status to error in case it prevents initialization
      // from completing at all.
      if (action.status !== 'active') {
        resultWithError.error = action.error
        resultWithError.errorContainerVersion = action.containerVersion
      }

      return resultWithError

    case 'reload':
      // Nothing needs to actually change in the state, but we do need to
      // force a re-render as mutable state has changed.
      return {
        ...state,
      }

    default:
      return state
  }
}

function demoboardInstanceInit(): UseDemoboardInstanceState {
  return {
    consoleLines: new Map(),
    error: null,
    errorContainerVersion: null,
  }
}

function updateContainer(state: UseDemoboardInstanceMutableState) {
  let runtime = state.runtime!
  let build = state.latest.build!
  let currentLocation = state.latest.currentLocation
  let runtimeInitialLocation = {
    href: currentLocation.uri,
    ...currentLocation,
  }

  state.latestContainerVersion += 1
  state.latestContainerBuild = build
  state.container = {
    build,
    currentLocation,
    lastInitVersion: state.container ? state.container.lastInitVersion : null,
  }

  const stringifiedId = JSON.stringify(runtime.options.id)
  const stringifiedInitialLocation = JSON.stringify(runtimeInitialLocation)
  const stringifiedEnv = JSON.stringify({
    DEMOBOARD_CONTAINER_URL: build.containerURL,
    DEMOBOARD_RUNTIME_URL: build.runtimeURL,
    DEMOBOARD_WORKER_URL: 'parent',
    DEMOBOARD: true,
  })

  let html =
    build.html &&
    build.html.replace(
      '<!--DEMOBOARD_SETTINGS-->',
      `<script>window.demoboardRuntime = window.setupDemoboardRuntime(${stringifiedId}, ${stringifiedInitialLocation}, ${state.latestContainerVersion}, ${stringifiedEnv})</script>`,
    )

  // This needs to be posted via a message instead of set as a prop
  // on the iframe, as it isn't actually being set on the iframe we
  // have access to -- it's being set on the nested iframe instead.
  runtime.setSource(html)
}

function computeStatus(
  mutableState: UseDemoboardInstanceMutableState,
): DemoboardInstanceStatus {
  let currentLocation = mutableState.latest.currentLocation
  let build = mutableState.latest.build

  let isExternal = currentLocation.uri.slice(0, 4) === 'http'
  let isEmpty = !build || (build.status !== 'busy' && build.html === null)
  let isError =
    mutableState.latestErrorContainerVersion ===
    mutableState.latestContainerVersion
  let isInitializing =
    !mutableState.hasStarted ||
    !mutableState.container ||
    !mutableState.container.lastInitVersion
  let isUpdating =
    build &&
    mutableState.container &&
    (build.status === 'busy' ||
      build.stale ||
      mutableState.container.lastInitVersion !==
        mutableState.latestContainerVersion)

  return isExternal
    ? 'external'
    : isEmpty
    ? 'empty'
    : isError
    ? 'error'
    : isInitializing
    ? 'initializing'
    : isUpdating
    ? 'updating'
    : 'active'
}
