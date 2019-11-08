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

const StyledIconButton = styled(Button)`
  display: flex;
`

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  raised?: boolean
  tooltip: string
  tooltipPlacement?: TooltipState['placement']
}

export function IconButton({
  children,
  raised = false,
  tooltip,
  tooltipPlacement = 'bottom',
  ...rest
}: IconButtonProps) {
  const tooltipState = useTooltipState({ placement: tooltipPlacement })

  return (
    <>
      <TooltipReference {...tooltipState} {...rest} as={StyledIconButton}>
        {children}
      </TooltipReference>
      <Tooltip {...tooltipState}>{tooltip}</Tooltip>
    </>
  )
}
