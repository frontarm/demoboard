/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import styled from 'styled-components'
import { Button } from 'reakit/Button'
import {
  Tooltip,
  TooltipReference,
  TooltipState,
  useTooltipState,
} from 'reakit/Tooltip'
import { beaconRing, colors, dimensions, radii } from '../constants'
import { StyledRaisedButtonBase } from './Buttons'
import { Icon, IconGlyph } from './Icon'

const StyledIconButton = styled(Button)`
  display: flex;
  height: ${dimensions.raisedButtonHeight};
  flex: ${dimensions.raisedButtonHeight} 0 0;
  border: none;
  padding: 0;
  background-color: transparent;
  justify-content: center;
  z-index: 0;
  position: relative;

  &[disabled] {
    opacity: 0.5;
  }

  ${beaconRing('::after')}
`

const StyledRaisedIconButton = styled(StyledRaisedButtonBase)`
  padding: 0;
  flex: ${dimensions.raisedButtonHeight} 0 0;
`

const StyledTooltip = styled.div`
  background-color: ${colors.lightBlack};
  border-radius: ${radii.small};
  color: ${colors.lighterGrey};
  font-size: 11px;
  padding: 4px;
  margin-top: 0;
  z-index: 999999;
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
  tooltip?: string
  tooltipPlacement?: TooltipState['placement']
}

export function IconButton({
  accessibilityLabel,
  color,
  glyph,
  glyphColor,
  inline,
  raised = false,
  testID,
  tooltip,
  tooltipPlacement = 'bottom',
  ...rest
}: IconButtonProps) {
  const tooltipState = useTooltipState({ placement: tooltipPlacement })

  if (glyphColor === undefined) {
    glyphColor = raised ? colors.white : colors.darkerGrey
  }

  return (
    <>
      <TooltipReference
        {...tooltipState}
        {...rest}
        as={raised ? StyledRaisedIconButton : StyledIconButton}
        color={color}>
        <Icon
          accessibilityLabel={accessibilityLabel}
          color={glyphColor}
          glyph={glyph}
          inline={inline}
          testID={testID}
        />
      </TooltipReference>
      <Tooltip {...tooltipState}>
        {tooltip && <StyledTooltip>{tooltip}</StyledTooltip>}
      </Tooltip>
    </>
  )
}
