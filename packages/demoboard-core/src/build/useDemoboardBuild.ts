/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { useContext, useEffect, useRef, useState } from 'react'
import { DemoboardContext, DemoboardWorkerContext } from '../DemoboardContext'
import { DemoboardBuild, DemoboardBuildConfig } from '../types'
import shallowCompare from '../utils/shallowCompare'
import generateDemoboardIFrameHTML from './generateDemoboardIFrameHTML'

const DefaultBaseURL = 'https://demoboard.io'

interface UseDemoboardBuildMutableState {
  buildStarted: boolean
  debounceTimeout: any
  latestConfig: DemoboardBuildConfig
  latestHTML: null | string
  version: number
}

export function useDemoboardBuild(
  id: string,
  config: DemoboardBuildConfig | null,
): DemoboardBuild | null {
  const {
    containerURL: defaultContainerURL,
    runtimeURL: defaultRuntimeURL,
  } = useContext(DemoboardContext)
  const { worker } = useContext(DemoboardWorkerContext)

  let {
    baseURL = DefaultBaseURL,
    buildRules,
    containerURL = defaultContainerURL,
    debounce = 666,
    pause,
    runtimeURL = defaultRuntimeURL,
    transformFetchOptions,
  } = config || {}

  let [build, setBuild] = useState<DemoboardBuild | null>(
    config && {
      config,
      containerURL,
      error: null,
      html: null,
      id,
      runtimeURL,
      status: 'busy',
      stale: false,
      transformedModules: null,
      version: 1,
    },
  )

  // Keep track of the latest version in a ref so that we can update it
  // without causing a re-render.
  let { current: mutableState } = useRef<UseDemoboardBuildMutableState>({
    buildStarted: false,
    debounceTimeout: undefined,

    // This is defined on the initial render immediately below.
    latestConfig: null as any,

    latestHTML: null,

    // This will be immediately incremented
    version: 0,
  })

  let previousConfig = mutableState.latestConfig as (DemoboardBuildConfig | null)
  if (config) {
    mutableState.latestConfig = config
  }

  let startBuild = async () => {
    let config = mutableState.latestConfig
    let version = mutableState.version

    // Avoid a double initial render
    if (!(version === 1 && build && build.version === 1)) {
      setBuild({
        config,
        containerURL,
        error: null,
        html: null,
        id,
        runtimeURL,
        status: 'busy',
        stale: false,
        transformedModules: null,
        version,
      })
    }

    mutableState.buildStarted = true

    worker
      .build({
        rules: buildRules,
        id,
        entryPathname: config.entryPathname,
        sources: config.sources,
        transformFetchOptions,
      })
      .then(result => {
        // Skip the update if a new update is already scheduled to occur.
        if (mutableState.version === version) {
          let html: null | string = null
          let htmlError: any
          if (!result.error) {
            html = mutableState.latestHTML
            if (!html || result.shouldRegenerateHTML)
              try {
                // This needs to be called in the main thread instead of the
                // worker due to a dependency on DOM XML parsing stuff, which
                // isn't available in workers
                html = generateDemoboardIFrameHTML(
                  config.entryPathname,
                  result.transformedModules,
                  baseURL,
                  runtimeURL,
                )
                mutableState.latestHTML = html
              } catch (error) {
                htmlError = error
              }
          }

          let error = result.error || htmlError || null

          setBuild({
            config,
            containerURL,
            error,
            html: error ? null : html,
            id,
            runtimeURL,
            status: error ? 'error' : 'success',
            stale: false,
            transformedModules: result.transformedModules,
            version,
          })
        }
      })
      .catch(error => {
        setBuild({
          config,
          containerURL,
          error,
          html: null,
          id,
          runtimeURL,
          status: 'error',
          stale: false,
          transformedModules: {},
          version,
        })
      })
  }

  // We only want to debounce when the sources change. Any other changes
  // should trigger an immediate rebuild to keep things feeling responsive.
  let hasReceivedNewConfig =
    !previousConfig ||
    (config &&
      (config.entryPathname !== previousConfig.entryPathname ||
        !shallowCompare(config.mocks, previousConfig.mocks)))
  let hasReceivedNewSources =
    config &&
    (!previousConfig || !shallowCompare(config.sources, previousConfig.sources))
  let hasDebounceBeenDisabled =
    config &&
    previousConfig &&
    config.debounce === 0 &&
    previousConfig.debounce !== 0
  let shouldCancelDebounceAndBuildImmediately =
    hasDebounceBeenDisabled &&
    !mutableState.buildStarted &&
    mutableState.debounceTimeout
  let shouldDebounceBuild =
    config &&
    hasReceivedNewSources &&
    !hasReceivedNewConfig &&
    config.debounce !== 0

  if (
    hasReceivedNewConfig ||
    hasReceivedNewSources ||
    shouldCancelDebounceAndBuildImmediately
  ) {
    // It's okay to repeat this multiple times for a single render,
    // so it doesn't need to go in an effect.
    mutableState.buildStarted = false
    mutableState.version += 1

    if (mutableState.debounceTimeout) {
      clearTimeout(mutableState.debounceTimeout)
      mutableState.debounceTimeout = undefined
    }
  }

  // Put this in an effect so that it isn't run on the server.
  useEffect(() => {
    if (shouldDebounceBuild) {
      mutableState.debounceTimeout = setTimeout(() => {
        mutableState.debounceTimeout = undefined

        // Check that this demoboard hasn't been paused or built in the
        // meantime.
        if (!mutableState.buildStarted && !mutableState.latestConfig.pause) {
          startBuild()
        }
      }, debounce)
    }
  })

  // If an immediate build is required, dispatch it in an effect so that
  // it won't be dispatched on the server.
  useEffect(() => {
    if (!pause && !mutableState.debounceTimeout) {
      startBuild()
    } else if (
      pause &&
      build &&
      !build.stale &&
      build.version !== mutableState.version
    ) {
      setBuild({
        ...build,
        stale: true,
      })
    }
    // `build` isn't included in the dependencies list, as this effect should
    // only be run when pause/version change -- and build will always be up
    // to date as version is computed from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pause, mutableState.version])

  // Clean up after ourselves
  useEffect(() => {
    return () => {
      clearTimeout(mutableState.debounceTimeout)
      worker.clearBuildCache(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return config ? build : null
}
