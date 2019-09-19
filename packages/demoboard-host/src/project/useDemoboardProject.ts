/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { Doc } from 'automerge'
import { useMemo, useReducer, useRef } from 'react'
import {
  DemoboardProject,
  DemoboardProjectConfig,
  DemoboardPanelType,
  DemoboardProjectData,
  DemoboardProjectState,
  DemoboardProjectView,
} from '../types'
import createInitialDemoboardProjectState from './createInitialDemoboardProjectState'
import demoboardProjectReducer from './demoboardProjectReducer'

export interface UseDemoboardProjectOptions<
  PanelType extends DemoboardPanelType = DemoboardPanelType
> extends DemoboardProjectConfig<PanelType> {
  config: DemoboardProjectConfig<PanelType>

  /**
   * If available on load, the previously persisted view state can be used
   * instead of the config's view.
   */
  defaultView?: Doc<DemoboardProjectView<PanelType>>

  /**
   * Not used internally, but will be passed through to the returned object.
   * Use if convenient.
   */
  id?: string

  /**
   * Updates to this should be reflected in our own data, or when they diverge
   * from our own updates then they should be output on
   * `divergedPersistentData`.
   */
  persistedData?: Doc<DemoboardProjectData>
}

export default function useDemoboardProject<
  PanelType extends DemoboardPanelType = DemoboardPanelType
>(options: UseDemoboardProjectOptions<PanelType>): DemoboardProject<PanelType> {
  let [state, dispatch] = useReducer(
    demoboardProjectReducer,
    options,
    createInitialReducerState,
  )
  let initialConfigRef = useRef(options.config)

  // TODO:
  // - watch changes to `persistedData`,
  // - if not diverged, dispatch an action to update the data before re-render
  //   (so useLayoutEffect)
  // - add project actions

  return useMemo(
    () => ({
      config: initialConfigRef.current,
      dispatch,

      // TODO: if there's a divergence, store it here.
      divergedPersistedData: null,

      id: options.id || null,
      state: state as DemoboardProjectState<PanelType>,
    }),
    [options.id, state],
  )
}

function createInitialReducerState(options: UseDemoboardProjectOptions<any>) {
  return createInitialDemoboardProjectState(options.config)
}
