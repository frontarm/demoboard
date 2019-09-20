/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { ReadonlyText, Text } from 'automerge'
import { useMemo, useReducer } from 'react'
import {
  DemoboardBuildConfig,
  DemoboardProject,
  DemoboardProjectConfig,
  DemoboardPanelType,
  DemoboardProjectData,
  DemoboardProjectState,
  DemoboardProjectView,
  DemoboardGeneratedFile,
} from '../types'
import createInitialDemoboardProjectState from './createInitialDemoboardProjectState'
import demoboardProjectReducer from './demoboardProjectReducer'
import { getLastRenderedLocation } from '../utils/history'

export interface UseDemoboardProjectOptions<
  PanelType extends DemoboardPanelType = DemoboardPanelType
> {
  config?: DemoboardProjectConfig<PanelType>

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

  return useMemo(
    () => ({
      buildConfig: getBuildConfig(state),
      dispatch,
      state: state as DemoboardProjectState<PanelType>,
    }),
    [state],
  )
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
): null | DemoboardBuildConfig {
  let {
    data: {
      dependencies,
      fallbackToRootIndex,
      indexPathnames,
      mocks,
      templates,
    },
    view: { activeTemplate, history },
  } = state

  let sources = state.data.sources as {
    [pathname: string]: string | ReadonlyText | DemoboardGeneratedFile
  }

  if (activeTemplate) {
    sources = templates[activeTemplate]
  }

  let renderedLocation = getLastRenderedLocation(history)

  let isExternal = renderedLocation.uri.slice(0, 4) === 'http'
  if (isExternal) {
    return null
  }

  let entryPathname = renderedLocation.pathname
  if (!sources[entryPathname] && !fallbackToRootIndex) {
    return null
  }

  let hasFoundIndex = false
  for (let indexPathname of indexPathnames) {
    if (sources[indexPathname]) {
      entryPathname = indexPathname
      hasFoundIndex = true
      break
    }
  }

  if (!hasFoundIndex) {
    return null
  }

  let renderedSources = {} as {
    [pathname: string]: string | DemoboardGeneratedFile
  }
  for (let pathname of Object.keys(sources)) {
    let source = sources[pathname]
    renderedSources[pathname] =
      source instanceof Text ? source.toString() : source
  }

  return {
    dependencies,
    entryPathname,
    mocks,
    sources: renderedSources,
  }
}
