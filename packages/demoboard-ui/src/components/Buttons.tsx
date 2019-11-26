/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { lighten } from 'polished'
import styled, { css } from 'styled-components'
import {
  beaconRing,
  colors,
  dimensions,
  easings,
  radii,
  shadows,
} from '../constants'

export interface StyledButtonBaseProps {
  color: string
  inline?: boolean
  leaveGlyphSpace?: boolean
  textColor: string
}

export const StyledRaisedButtonBase = styled.button<StyledButtonBaseProps>`
  border-radius: ${radii.small};
  background-color: ${props => props.color};
  border: none;
  box-shadow: ${shadows.bevel()}, ${shadows.drop()};
  color: ${props => props.textColor};
  cursor: pointer;
  display: flex;
  height: ${dimensions.raisedButtonHeight};
  justify-content: center;
  line-height: ${dimensions.raisedButtonHeight};
  outline: none;
  position: relative;
  text-align: center;
  transition: background-color 200ms ${easings.easeOut},
    opacity 200ms ${easings.easeOut}, box-shadow 200ms ${easings.easeOut},
    color 200ms ${easings.easeOut};
  white-space: nowrap;
  z-index: 0;

  :hover {
    background-color: ${props => lighten(0.03, props.color)};
  }

  :active {
    box-shadow: ${shadows.bevelReverse()}, ${shadows.drop()};
  }

  ${beaconRing('::after')}

  ${props =>
    props.disabled &&
    css`
      opacity: 0.5;
    `}
`

StyledRaisedButtonBase.defaultProps = {
  color: colors.grey,
  textColor: colors.white,
}
