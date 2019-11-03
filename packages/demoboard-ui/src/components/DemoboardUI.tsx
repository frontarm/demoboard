/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React, { useMemo } from 'react'
import { useTabState } from 'reakit/Tab'
import {
  DemoboardBuild,
  DemoboardInstance,
  DemoboardLayout,
  DemoboardProject,
} from '@frontarm/demoboard-core'

import { BuildError } from './BuildError'
import { CodeMirrorEditorGlobalStyles } from './CodeMirrorEditor.styles'
import {
  IFrameLoadingOverlay,
  StyledContainer,
  IFrame,
  StyledIFrameWrapper,
  StyledViewer,
  StyledProject,
  WrappedEditor,
} from './DemoboardUI.styles'
import { OpenTabList } from './OpenTabList'
import addDefaultPixelUnits from '../utils/addDefaultPixelUnits'

export function DemoboardUIGlobalStyles() {
  return <CodeMirrorEditorGlobalStyles />
}

export interface DemoboardUIOptions {
  colorTheme?: 'light' | 'dark'
}

export interface DemoboardUIProps extends DemoboardUIOptions {
  build: DemoboardBuild | null
  instance: DemoboardInstance
  layout: {
    width?: string | number
    height?: string | number
  }
  project: DemoboardProject
}

export function DemoboardUI(props: DemoboardUIProps) {
  const {
    build,
    instance,
    layout: { height = '400px', width = '800px' },
    project,

    colorTheme = 'light',
  } = props

  const error = (build && build.error) || instance.error
  const {
    dispatch,
    sources,
    state: { view },
  } = project
  const tabState = useTabState({
    manual: true,
    selectedId: view.selectedTab,
  })
  const tab = useMemo(
    () => ({
      ...tabState,
      select: (pathname: string | null) => {
        dispatch({
          type: 'tabs.select',
          pathname,
        })
        tabState.select(pathname)
      },
    }),
    [dispatch, tabState],
  )

  return (
    <StyledContainer
      height={addDefaultPixelUnits(height)}
      width={addDefaultPixelUnits(width)}>
      <StyledProject>
        <OpenTabList {...tab} pathnames={view.tabs} />
        {view.selectedTab ? (
          <WrappedEditor
            mode={view.selectedTab.split('.').reverse()[0]}
            value={sources[view.selectedTab].toString()}
            onChange={(value, changes, doc) => {
              project.dispatch({
                type: 'sources.change',
                pathname: view.selectedTab!,
                codeMirrorChanges: changes,
                codeMirrorDoc: doc,
              })
            }}
          />
        ) : (
          <div>No file selected</div>
        )}
      </StyledProject>
      <StyledViewer>
        <StyledIFrameWrapper>
          <IFrame instance={instance} />
          <IFrameLoadingOverlay
            active={
              instance.status === 'initializing' ||
              instance.status === 'updating'
            }
          />
          {error && <BuildError error={error} />}
        </StyledIFrameWrapper>
      </StyledViewer>
    </StyledContainer>
  )
}
