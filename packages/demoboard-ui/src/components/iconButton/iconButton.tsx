/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { rgba } from 'polished'
import React from 'react'
import { Button } from 'reakit/Button'
import styled from 'styled-components'
import { beaconRing, colors, dimensions, easings } from '../../constants'
import { StyledRaisedButtonBase } from '../Buttons'
import { Icon, IconGlyph } from '../Icon'
import { Tooltip, TooltipPlacement } from '../tooltip'

const StyledIconButton = styled(Button)`
  appearance: none;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  height: ${dimensions.raisedButtonHeight};
  justify-content: center;
  outline: none;
  padding: 0;
  position: relative;
  transition: background-color 200ms ${easings.easeOut};
  width: ${dimensions.raisedButtonHeight};
  z-index: 0;

  &[disabled] {
    cursor: auto;
  }

  border-radius: 99px;

  &:not([disabled]):hover {
    background-color: ${rgba(colors.lightGrey, 0.5)};
  }

  ${beaconRing('::after', '99px')}
`

const StyledRaisedIconButton = styled(StyledRaisedButtonBase)`
  padding: 0;
  width: ${dimensions.raisedButtonHeight};
  flex: 0 0 ${dimensions.raisedButtonHeight};
`

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  accessibilityLabel?: string
  color?: string
  glyph: IconGlyph
  glyphColor?: string
  inline?: boolean
  raised?: boolean
  testID?: string
  tooltip?: string | null
  tooltipPlacement?: TooltipPlacement
}

export function IconButton({
  accessibilityLabel,
  color,
  disabled,
  glyph,
  glyphColor,
  inline,
  raised = false,
  testID,
  tooltip = null,
  tooltipPlacement = 'bottom',
  ...rest
}: IconButtonProps) {
  if (glyphColor === undefined) {
    glyphColor = raised ? colors.white : colors.darkerGrey
  }

  const StyledButton = raised ? StyledRaisedIconButton : StyledIconButton

  return (
    <Tooltip label={tooltip} placement={tooltipPlacement}>
      {(tooltipProps: any) => (
        <StyledButton
          color={color}
          disabled={disabled}
          {...tooltipProps}
          {...rest}>
          <Icon
            accessibilityLabel={accessibilityLabel}
            color={disabled ? rgba(glyphColor!, 0.5) : glyphColor}
            glyph={glyph}
            inline={inline}
            testID={testID}
          />
        </StyledButton>
      )}
    </Tooltip>
  )
}
