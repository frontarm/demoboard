/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { ReadonlyText, Text } from 'automerge'
import { useContext, useMemo, useReducer } from 'react'
import { DemoboardContext } from '../DemoboardContext'
import {
  DemoboardBuildConfig,
  DemoboardGeneratedFile,
  DemoboardGenerator,
  DemoboardProject,
  DemoboardProjectConfig,
  DemoboardPanelType,
  DemoboardProjectData,
  DemoboardProjectState,
  DemoboardProjectView,
} from '../types'
import createInitialDemoboardProjectState from './createInitialDemoboardProjectState'
import demoboardProjectReducer from './demoboardProjectReducer'
import {
  getCurrentLocation,
  getLastRenderedLocation,
  canGo,
} from '../utils/history'

export interface UseDemoboardProjectOptions<
  PanelType extends DemoboardPanelType = DemoboardPanelType
> {
  config?: DemoboardProjectConfig<PanelType>

  /**
   * An object that will be passed to generated sources, and can be used to
   * configure generated sources for individual users.
   */
  generatorContext?: any

  /**
   * If available on load, the previously persisted view state can be used
   * instead of the config's view.
   */
  initialState?: {
    data: DemoboardProjectData
    view: DemoboardProjectView
  }
}

export function useDemoboardProject<
  PanelType extends DemoboardPanelType = DemoboardPanelType
>(options: UseDemoboardProjectOptions<PanelType>): DemoboardProject<PanelType> {
  let [state, dispatch] = useReducer(
    demoboardProjectReducer,
    options,
    createInitialReducerState,
  )
  let { generators } = useContext(DemoboardContext)

  return useMemo(() => {
    let sources = renderSources(state, generators, options.generatorContext)
    return {
      buildConfig: getBuildConfig(state, sources),
      dispatch,
      sources,
      state: state as DemoboardProjectState<PanelType>,
      navigation: {
        canGoBack: canGo(state.view.history, -1),
        canGoForward: canGo(state.view.history, 1),
        currentLocation: getCurrentLocation(state.view.history),
      },
    }
  }, [generators, state, options.generatorContext])
}

function createInitialReducerState(
  options: UseDemoboardProjectOptions<any>,
): DemoboardProjectState<any> {
  if (options.config && options.initialState) {
    console.warn(
      `useDemoboardProject expected to receive a "config" or "initialState" object, but not both. Using "initialState".`,
    )
  }
  if (!options.config && !options.initialState) {
    throw new Error(
      `useDemoboardProject expected to receive a "config" or "initialState" object.`,
    )
  }

  return options.initialState
    ? { ...options.initialState, unpersistedCodeMirrorDocs: {} }
    : createInitialDemoboardProjectState(options.config!)
}

function getBuildConfig(
  state: DemoboardProjectState,
  sources: {
    [pathname: string]: string
  },
): null | DemoboardBuildConfig {
  let {
    data: { dependencies, fallbackToRootIndex, indexPathnames, mocks },
    view: { history },
  } = state

  let renderedLocation = getLastRenderedLocation(history)

  let isExternal = renderedLocation.uri.slice(0, 4) === 'http'
  if (isExternal) {
    return null
  }

  let entryPathname = renderedLocation.pathname
  if (!sources[entryPathname] && !fallbackToRootIndex) {
    return null
  }

  let hasFoundIndex = !!sources[entryPathname]
  if (!hasFoundIndex) {
    for (let indexPathname of indexPathnames) {
      if (sources[indexPathname]) {
        entryPathname = indexPathname
        hasFoundIndex = true
        break
      }
    }
  }
  if (!hasFoundIndex) {
    return null
  }

  return {
    dependencies,
    entryPathname,
    mocks,
    sources,
  }
}

function renderSources(
  state: DemoboardProjectState,
  generators: {
    [name: string]: DemoboardGenerator
  },
  generatorContext: any,
): { [pathname: string]: string } {
  let {
    data: { dependencies, templates },
    view: { activeTemplate },
  } = state

  let sources = state.data.sources as {
    [pathname: string]: string | ReadonlyText | DemoboardGeneratedFile
  }

  if (activeTemplate) {
    sources = templates[activeTemplate]
  }

  let renderedSources = {} as {
    [pathname: string]: string
  }
  let pathnames = Object.keys(sources)
  for (let pathname of pathnames) {
    let source = sources[pathname]
    let renderedSource =
      source instanceof Text || typeof source === 'string'
        ? source.toString()
        : generateSource({
            dependencies,
            generators,
            context: generatorContext,
            metadata: state.data.metadata,
            pathname,
            pathnames,
            source: source,
          })
    if (renderedSource !== null) {
      renderedSources[pathname] = renderedSource
    }
  }

  return renderedSources
}

interface GenerateSourceOptions {
  context: any
  dependencies: {
    [name: string]: string
  }
  generators: {
    [name: string]: DemoboardGenerator
  }
  metadata: any
  pathname: string
  pathnames: string[]
  source: DemoboardGeneratedFile
}

function generateSource({
  context,
  dependencies,
  generators,
  metadata,
  pathname,
  pathnames,
  source,
}: GenerateSourceOptions): string | null {
  let { type, props } = source
  let generator = generators[type]
  if (!generator) {
    throw new Error(`Unknown generator "${type}"`)
  }
  return generator({
    context,
    dependencies,
    metadata,
    pathname,
    pathnames,
    props,
  })
}
