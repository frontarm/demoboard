/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, useState } from 'react'
import worker from '../demoboardWorker'
import { DemoboardBuild, DemoboardBuildConfig } from '../types'
import shallowCompare from '../utils/shallowCompare'
import generateDemoboardIFrameHTML from './generateDemoboardIFrameHTML'

// This is a function instead of a constant so that we can avoid executing it
// within the jsdom-based test environment.
const getDefaultRuntimeURL = () =>
  process.env.PUBLIC_URL +
  (process.env.NODE_ENV === 'production'
    ? // eslint-disable-next-line import/no-webpack-loader-syntax
      require('file-loader!@frontarm/demoboard-runtime/dist/demoboard-runtime.min.js')
    : // eslint-disable-next-line import/no-webpack-loader-syntax
      require('file-loader!@frontarm/demoboard-runtime/dist/demoboard-runtime.js'))

const DefaultBaseURL = 'https://demoboard.frontarm.com'

let nextBuildId = 1

interface UseDemoboardBuildMutableState {
  builderId: string
  buildStarted: boolean
  debounceTimeout: any
  latestConfig: DemoboardBuildConfig
  latestHTML: null | string
  version: number
}

export function useDemoboardBuild(
  config: DemoboardBuildConfig,
): DemoboardBuild | null {
  let {
    baseURL = DefaultBaseURL,
    debounce = 666,
    pause,
    runtimeURL = undefined,
  } = config

  if (runtimeURL === undefined) {
    runtimeURL = getDefaultRuntimeURL()
  }

  let [build, setBuild] = useState<DemoboardBuild | null>(null)

  // Keep track of the latest version in a ref so that we can update it
  // without causing a re-render.
  let { current: mutableState } = useRef<UseDemoboardBuildMutableState>({
    // This is added below, so that nextBuildId doesn't need to be increased
    // on every render.
    builderId: undefined as any,

    buildStarted: false,
    debounceTimeout: undefined,

    // This is defined on the initial render immediately below.
    latestConfig: null as any,

    latestHTML: null,

    version: 1,
  })

  // Create a unique id for each build hook, so that the worker knows what
  // to clean up once the hook is unmounted.
  if (!mutableState.builderId) {
    mutableState.builderId = String(nextBuildId++)
  }

  let previousConfig = mutableState.latestConfig as (DemoboardBuildConfig | null)
  mutableState.latestConfig = config

  let startBuild = async () => {
    let config = mutableState.latestConfig
    let version = mutableState.version

    setBuild({
      config,
      error: null,
      html: null,
      status: 'busy',
      stale: false,
      transformedModules: null,
      version,
    })

    mutableState.buildStarted = true

    worker
      .build({
        id: mutableState.builderId,
        entryPathname: config.entryPathname,
        sources: config.sources,
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
                  runtimeURL as string,
                )
                mutableState.latestHTML = html
              } catch (error) {
                htmlError = error
              }
          }

          let error = result.error || htmlError || null

          setBuild({
            config,
            error,
            html: error ? null : html,
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
          error,
          html: null,
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
    config.entryPathname !== previousConfig.entryPathname ||
    !shallowCompare(config.mocks, previousConfig.mocks)
  let hasReceivedNewSources =
    !previousConfig || !shallowCompare(config.sources, previousConfig.sources)
  let hasDebounceBeenDisabled =
    previousConfig && config.debounce === 0 && previousConfig.debounce !== 0
  let shouldCancelDebounceAndBuildImmediately =
    hasDebounceBeenDisabled &&
    !mutableState.buildStarted &&
    mutableState.debounceTimeout
  let shouldDebounceBuild =
    hasReceivedNewSources && !hasReceivedNewConfig && config.debounce !== 0

  if (
    hasReceivedNewConfig ||
    hasReceivedNewSources ||
    shouldCancelDebounceAndBuildImmediately
  ) {
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
      worker.clearBuildCache(mutableState.builderId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return build
}
