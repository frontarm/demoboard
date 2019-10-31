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
  DemoboardInstanceIFrame,
} from '@frontarm/demoboard-core'

import { CodeMirrorEditor } from './CodeMirrorEditor'
import { CodeMirrorEditorGlobalStyles } from './CodeMirrorEditor.styles'

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

  const dispatch = project.dispatch
  const { view, data } = project.state
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
    <div>
      <TabList {...tab} aria-label="Open files">
        {view.tabs.map(pathname => (
          <Tab {...tab} key={pathname} stopId={pathname}>
            {pathname.slice(1)}
          </Tab>
        ))}
      </TabList>
      {view.selectedTab ? (
        <CodeMirrorEditor
          mode={view.selectedTab.split('.').reverse()[0]}
          value={project.sources[view.selectedTab].toString()}
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
      <h2>Output</h2>
      <DemoboardInstanceIFrame
        instance={instance}
        style={{
          border: '1px inset #CCC',
          display: 'block',
          marginBottom: '16px',
          width: 600,
          height: 100,
        }}
      />
    </div>
  )
}
