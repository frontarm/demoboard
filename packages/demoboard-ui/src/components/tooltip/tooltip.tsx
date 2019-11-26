/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import styled from 'styled-components'
import {
  Tooltip as ReakitTooltip,
  TooltipReference,
  TooltipReferenceProps,
  TooltipState,
  useTooltipState,
} from 'reakit/Tooltip'
import { colors, fonts, radii } from '../../constants'

const StyledTooltip = styled(ReakitTooltip)`
  background-color: ${colors.black};
  border-radius: ${radii.small};
  color: ${colors.lighterGrey};
  font-family: ${fonts.sansSerif};
  font-size: 11px;
  padding: 4px;
  margin-top: 0;
  z-index: 99999;
`

export type TooltipPlacement = TooltipState['placement']

export interface TooltipProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: TooltipReferenceProps['children']
  gutter?: number
  label: string | null
  placement?: TooltipState['placement']
  testID?: string
}

export function Tooltip({
  children,
  gutter = 6,
  testID,
  label,
  placement = 'bottom',
  ...rest
}: TooltipProps) {
  const tooltipState = useTooltipState({
    gutter,
    placement,
  })

  return (
    <>
      <TooltipReference {...tooltipState}>{children}</TooltipReference>
      {label && (
        <StyledTooltip {...tooltipState} {...rest} data-testid={testID}>
          {label}
        </StyledTooltip>
      )}
    </>
  )
}
