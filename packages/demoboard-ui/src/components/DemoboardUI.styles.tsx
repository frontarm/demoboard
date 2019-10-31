/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import styled, { css } from 'styled-components'
import { DemoboardInstanceIFrame } from '@frontarm/demoboard-core'

import { colors, dimensions } from '../constants'

import { Spinner } from './Spinner'
import { CodeMirrorEditorProps, CodeMirrorEditor } from './CodeMirrorEditor'

export interface StyledContainerProps {
  height: string
  width: string
}

export const StyledContainer = styled.div<StyledContainerProps>`
  background-color: ${colors.lightGrey};
  border-radius: 5px;

  display: flex;
  height: ${props => props.height};
  width: ${props => props.width};
`

export const StyledIFrame = styled(DemoboardInstanceIFrame)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  border: 0;
  width: 100%;
  height: 100%;
  background-color: white;
`

export const IFrameLoadingOverlay = ({ active }: { active: boolean }) => (
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
      Build In Progress
    </span>
  </div>
)

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
  margin: 2px 2px 2px 0;
  position: relative;
`

export const StyledProject = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

export const StyledProjectHeader = styled.div`
  display: flex;
  flex-basis: ${dimensions.headerHeight};
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: ${colors.lightBlack};
  position: relative;
`

export function WrappedEditor(props: CodeMirrorEditorProps) {
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
        <CodeMirrorEditor lineNumbers {...props} />
      </div>
    </div>
  )
}
