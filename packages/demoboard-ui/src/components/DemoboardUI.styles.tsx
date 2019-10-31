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

export const StyledContainer = styled.div`
  background-color: ${colors.lightGrey};
  border-radius: 5px;

  display: flex;
  height: 400px;
  width: 800px;
`

export const StyledIFrameWrapper = styled.div`
  position: relative;
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 0;
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
