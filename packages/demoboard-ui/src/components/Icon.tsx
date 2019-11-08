/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import styled, { css } from 'styled-components'
import * as Icons from '../icons/components'

import { colors } from '../constants'
import addDefaultPixelUnits from '../utils/addDefaultPixelUnits'

export type IconGlyph = keyof typeof Icons

const DEFAULT_ICON_SIZE = '16px'

interface StyledIconContainerProps {
  inline: boolean
}

const StyledIconContainer = styled.div<StyledIconContainerProps>`
  display: ${props => (props.inline ? 'inline-flex' : 'flex')};
  text-align: center;
`

interface StyledIconProps {
  size: string
  viewBox?: string
}

const StyledIcon = styled.div<StyledIconProps>`
  display: block;
  margin: 0 auto;
  height: ${props => props.size};
  width: ${props => props.size};

  ${props =>
    props.color &&
    css`
      fill: ${props.color};
    `}
`

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  accessibilityLabel?: string
  color?: string
  glyph: IconGlyph
  inline?: boolean
  testID?: string
  size?: string | number
}

export const Icon = React.forwardRef<HTMLDivElement, IconProps>(
  (
    {
      accessibilityLabel,
      color = colors.darkGrey,
      glyph,
      inline = true,
      size = DEFAULT_ICON_SIZE,
      testID,
      ...props
    },
    ref,
  ) => {
    const IconComponent = Icons[glyph]
    const sizeWithUnits = addDefaultPixelUnits(size)

    return (
      <StyledIconContainer inline={inline} {...props}>
        <StyledIcon
          size={sizeWithUnits}
          color={color}
          as={IconComponent}
          ref={ref}
          role="img"
          viewBox="0 0 24 24"
          aria-label={accessibilityLabel}
          data-testid={testID}
        />
      </StyledIconContainer>
    )
  },
)
