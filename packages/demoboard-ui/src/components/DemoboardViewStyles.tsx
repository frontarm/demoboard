/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import styled, { css } from 'styled-components'
import {
  DemoboardInstanceIFrame,
  DemoboardInstanceIFrameProps,
  DemoboardBuild,
  DemoboardInstance,
} from '@frontarm/demoboard-core'

import { colors, dimensions } from '../constants'

import { Spinner } from './Spinner'
import { CodeMirrorEditorProps, CodeMirrorEditor } from './CodeMirrorEditor'

export interface StyledContainerProps {
  height?: string
  width?: string
}

export const StyledContainer = styled.div<StyledContainerProps>`
  background-color: ${colors.lighterGrey};
  border-radius: 5px;

  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;

  display: flex;
  ${props => ({ height: props.height, width: props.width })}
`

const StyledIFrame = styled(DemoboardInstanceIFrame)`
  position: absolute;
  border: none;
  top: 0;
  left: 0;
  border: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: white;
`

export const IFrame = (props: DemoboardInstanceIFrameProps) => {
  return <StyledIFrame {...props} />
}

export const IFrameLoadingOverlay = ({
  build,
  instance,
}: {
  build: DemoboardBuild | null
  instance: DemoboardInstance
}) => {
  const active =
    instance.status === 'initializing' || instance.status === 'updating'

  const message =
    build && build.status === 'busy' ? 'Building' : 'Fetching dependencies'

  return (
    <div
      css={css`
        position: absolute;
        background-color: white;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        pointer-events: none;

        /* Delay showing the working indicator for half a second */
        transition: opacity ease-in 333ms;
        transition-delay: 0;
        opacity: 0;

        ${active &&
          css`
            transition-delay: 500ms;
            opacity: 1;
            cursor: progress;
          `}
      `}>
      <Spinner
        css={css`
          position: relative;
          margin: 0 auto;
        `}
      />
      <span
        css={css`
          display: block;
          margin: 0.5rem 0;
          text-align: center;
          color: ${colors.lightGrey};
          text-transform: uppercase;
          letter-spacing: 0.15em;
        `}>
        {message}
      </span>
    </div>
  )
}

export const StyledIFrameWrapper = styled.div`
  position: relative;
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 0;
`

export const StyledViewer = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0 2px 0 0;
  position: relative;
`

export const StyledFooter = styled.footer`
  display: flex;
  background-color: ${colors.lighterGrey};
  flex-basis: ${dimensions.footerHeight};
  justify-content: stretch;
  align-items: center;
  width: 100%;
  position: relative;
`

export const StyledHeader = styled.header`
  display: flex;
  background-color: ${props => props.color};
  flex-basis: ${dimensions.headerHeight};
  justify-content: stretch;
  align-items: center;
  width: 100%;
  position: relative;
`

export const StyledProject = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

export const StyledViewerHeader = (
  props: React.ComponentProps<typeof StyledHeader>,
) => <StyledHeader {...props} color={colors.lighterGrey} />

export const StyledProjectHeader = (
  props: React.ComponentProps<typeof StyledHeader>,
) => <StyledHeader {...props} color={colors.lightGrey} />

export function WrappedEditor({ config, ...rest }: CodeMirrorEditorProps) {
  return (
    <div
      css={css`
        position: relative;
        flex-grow: 1;
        flex-basis: 1rem;
      `}>
      <div
        css={css`
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          overflow: hidden;
        `}>
        <CodeMirrorEditor config={{ lineNumbers: true, ...config }} {...rest} />
      </div>
    </div>
  )
}
