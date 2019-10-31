/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React, { useMemo } from 'react'
import { useTabState, Tab, TabList } from 'reakit/Tab'
import {
  DemoboardBuild,
  DemoboardInstance,
  DemoboardLayout,
  DemoboardProject,
} from '@frontarm/demoboard-core'

import { CodeMirrorEditor } from './CodeMirrorEditor'
import { CodeMirrorEditorGlobalStyles } from './CodeMirrorEditor.styles'
import {
  StyledContainer,
  StyledIFrame,
  StyledIFrameWrapper,
  IFrameLoadingOverlay,
  StyledViewer,
  StyledProject,
} from './DemoboardUI.styles'
import { OpenTabList } from './OpenTabList'

export function DemoboardUIGlobalStyles() {
  return <CodeMirrorEditorGlobalStyles />
}

export interface DemoboardUIProps {
  build: DemoboardBuild | null
  instance: DemoboardInstance
  // layout: DemoboardLayout
  project: DemoboardProject

  colorTheme?: 'light' | 'dark'
}

export function DemoboardUI(props: DemoboardUIProps) {
  const {
    build,
    instance,
    // layout,
    project,

    colorTheme = 'light',
  } = props

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
    <StyledContainer>
      <StyledProject>
        <OpenTabList {...tab} pathnames={view.tabs} />
        {view.selectedTab ? (
          <CodeMirrorEditor
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
          <StyledIFrame instance={instance} />
          <IFrameLoadingOverlay
            active={
              instance.status === 'initializing' ||
              instance.status === 'updating'
            }
          />
        </StyledIFrameWrapper>
      </StyledViewer>
    </StyledContainer>
  )
}
