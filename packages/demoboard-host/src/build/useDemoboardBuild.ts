/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import worker from '../demoboardWorker'
import generateDemoboardIFrameHTML from './generateDemoboardIFrameHTML'
import { DemoboardBuild } from '../types/DemoboardBuild'
import shallowCompare from '../utils/shallowCompare'
import { DemoboardProjectState } from '../types'

let nextBuildId = 1

const emptyObject = {}

export interface UseDemoboardBuildOptions {
  // TODO:
  // - instead of entrypathname, accept a full DemobaordProjectState object and use
  //   that to compute entry pathname, generated sources, sources, etc.
  project: DemoboardProjectState
  // entryPathname: string

  /**
   * Specify packages that should be used to generate default sources for
   * specific files as they're required.
   */
  generatedSources?: { [pathname: string]: string }

  /**
   * Specify packages/modules that should be mocked with other packages/modules.
   */
  mocks?: { [module: string]: string }

  sources: { [pathname: string]: string }

  /**
   * The number of milliseconds to debounce changes before rebuilding.
   */
  debounce?: number

  /**
   * If true, the build will be paused without removing the cache, and
   * the build will be considered `busy`.
   *
   * This should always be set to true when rendering server-side. It also
   * can be set to true while the demoboard is off screen.
   */
  pause?: boolean
}

interface UseDemoboardBuildMutableState {
  builderId: string
  buildStarted: boolean
  debounceTimeout: any
  latestOptions: UseDemoboardBuildOptions
  version: number
}

export function useDemoboardBuild(
  options: UseDemoboardBuildOptions,
): DemoboardBuild | null {
  let { debounce = 666, pause } = options

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
    latestOptions: null as any,

    version: 1,
  })

  // Create a unique id for each build hook, so that the worker knows what
  // to clean up once the hook is unmounted.
  if (!mutableState.builderId) {
    mutableState.builderId = String(nextBuildId++)
  }

  let previousOptions = mutableState.latestOptions as (UseDemoboardBuildOptions | null)
  mutableState.latestOptions = options

  let startBuild = () => {
    let options = mutableState.latestOptions
    let version = mutableState.version
    let sources = addGeneratedSources(options.sources, options.generatedSources)
    let buildOptions = {
      entryPathname: options.entryPathname,
      mocks: options.mocks || emptyObject,
      sources: sources,
    }

    mutableState.buildStarted = true

    setBuild({
      ...buildOptions,
      status: 'busy',
      stale: false,
      version,
    })

    worker.build(mutableState.builderId, buildOptions).then(result => {
      // Skip the update if a new update is already scheduled to occur.
      if (mutableState.version === version) {
        let html, htmlError
        if (!result.error && result.shouldRegenerateHTML) {
          try {
            // This needs to be called in the main thread instead of the worker
            // due to a dependency on DOM XML parsing stuff.
            html = generateDemoboardIFrameHTML(
              buildOptions.entryPathname,
              result.transpiledModules,
            )
          } catch (error) {
            htmlError = error
          }
        }

        let error = result.error || htmlError

        setBuild({
          ...buildOptions,
          status: error ? 'error' : 'success',
          stale: false,
          error,
          version,
          result: {
            ...result,
            html,
          },
        })
      }
    })
  }

  // We only want to debounce when the sources change. Any other changes
  // should trigger an immediate rebuild to keep things feeling responsive.
  let hasReceivedNewConfig =
    !previousOptions ||
    options.entryPathname !== previousOptions.entryPathname ||
    !shallowCompare(options.mocks, previousOptions.mocks) ||
    !shallowCompare(options.generatedSources, previousOptions.generatedSources)
  let hasReceivedNewSources =
    !previousOptions ||
    !shallowCompare(options.sources, previousOptions.sources)
  let hasDebounceBeenDisabled =
    previousOptions && options.debounce === 0 && previousOptions.debounce !== 0
  let shouldCancelDebounceAndBuildImmediately =
    hasDebounceBeenDisabled &&
    !mutableState.buildStarted &&
    mutableState.debounceTimeout
  let shouldDebounceBuild =
    hasReceivedNewSources && !hasReceivedNewConfig && options.debounce !== 0

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
  useLayoutEffect(() => {
    if (shouldDebounceBuild) {
      mutableState.debounceTimeout = setTimeout(() => {
        mutableState.debounceTimeout = undefined

        // Check that this demoboard hasn't been paused or built in the
        // meantime.
        if (!mutableState.buildStarted && !mutableState.latestOptions.pause) {
          startBuild()
        }
      }, debounce)
    }
  })

  // If an immediate build is required, dispatch it in a layout effect so that
  // the update appears in the same paint as whatever caused the change.
  useLayoutEffect(() => {
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
  }, [pause, mutableState.version])

  // Clean up after ourselves
  useEffect(() => {
    return () => {
      clearTimeout(mutableState.debounceTimeout)
      worker.clearBuildCache(mutableState.builderId)
    }
  }, [])

  return build
}
