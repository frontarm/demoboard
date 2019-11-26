/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React, { useCallback } from 'react'
import { css } from 'styled-components'
import {
  DemoboardBuild,
  DemoboardInstance,
  DemoboardLayout,
  DemoboardProject,
  normalizeReferencedPathname,
} from '@frontarm/demoboard-core'

import { BuildError } from './buildError'
import { CodeMirrorEditorGlobalStyles } from './CodeMirrorEditorStyles'
import {
  IFrameLoadingOverlay,
  IFrame,
  StyledContainer,
  StyledFooter,
  StyledIFrameWrapper,
  StyledViewer,
  StyledViewerHeader,
  StyledProject,
  StyledProjectHeader,
  WrappedEditor,
} from './DemoboardViewStyles'
import { IconButton } from './iconButton'
import {
  NavigationBar,
  useProjectNavigationBarState,
} from './navigationBar/navigationBar'
import { OpenTabList } from './openTabList'
import { PanelTabList } from './panelTabList'
import addDefaultPixelUnits from '../utils/addDefaultPixelUnits'

export function DemoboardViewGlobalStyles() {
  return <CodeMirrorEditorGlobalStyles />
}

export interface DemoboardViewOptions {
  colorTheme?: 'light' | 'dark'
}

export interface DemoboardViewProps
  extends DemoboardViewOptions,
    React.HTMLAttributes<HTMLDivElement> {
  CodeMirror?: any
  build: DemoboardBuild | null
  instance: DemoboardInstance
  layout?: {
    width?: string | number
    height?: string | number
  }
  project: DemoboardProject
}

export function DemoboardView(props: DemoboardViewProps) {
  const {
    CodeMirror,

    build,
    instance,
    layout: { height = '400px', width = '800px' } = {},
    project,

    colorTheme = 'light',

    ...htmlAttributes
  } = props

  const error = (build && build.error) || instance.error
  const {
    dispatch,
    sources,
    state: { view },
  } = project

  const handleAdd = useCallback(() => {
    let pathname = window.prompt('What will your file be called?')
    if (!pathname) {
      return
    }
    let normalizedPathname = normalizeReferencedPathname(pathname)
    dispatch({
      type: 'sources.create',
      pathname: normalizedPathname,
      source: '',
    })
  }, [dispatch])

  const handleCloseTab = useCallback(
    (pathname: string) => {
      dispatch({
        type: 'tabs.close',
        pathname,
      })
    },
    [dispatch],
  )

  const handleSelectTab = useCallback(
    (pathname: string | null) => {
      dispatch({
        type: 'tabs.select',
        pathname,
      })
    },
    [dispatch],
  )

  const projectNavigationBarState = useProjectNavigationBarState(project)

  return (
    <StyledContainer
      height={addDefaultPixelUnits(height)}
      width={addDefaultPixelUnits(width)}
      {...htmlAttributes}>
      <StyledProject>
        <StyledProjectHeader>
          <OpenTabList
            selected={view.selectedTab}
            tabs={view.tabs}
            onClose={handleCloseTab}
            onSelect={handleSelectTab}
          />
          <IconButton
            css={css`
              margin: 0 4px;
            `}
            glyph="add"
            raised
            tooltip="Add a file"
            onClick={handleAdd}>
            Add
          </IconButton>
        </StyledProjectHeader>
        {view.selectedTab ? (
          <WrappedEditor
            CodeMirror={CodeMirror}
            docName={view.selectedTab}
            value={sources[view.selectedTab].toString()}
            onChange={(value, docName, changes, doc) => {
              project.dispatch({
                type: 'sources.change',
                pathname: docName!,
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
        <StyledViewerHeader>
          <NavigationBar {...projectNavigationBarState} />
        </StyledViewerHeader>
        <StyledIFrameWrapper>
          <IFrame instance={instance} />
          <IFrameLoadingOverlay build={build} instance={instance} />
          {error && <BuildError error={error} />}
        </StyledIFrameWrapper>
        <StyledFooter>
          <PanelTabList project={project} />
        </StyledFooter>
      </StyledViewer>
    </StyledContainer>
  )
}
