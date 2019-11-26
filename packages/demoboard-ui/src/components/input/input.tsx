/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { rgba } from 'polished'
import React, { useCallback } from 'react'
import styled from 'styled-components'

import { beaconRing, colors, easings, shadows } from '../../constants'

const StyledInputOutline = styled.div``
const StyledInputWrapper = styled.div`
  position: relative;
  background-color: ${colors.white};
  border-radius: 99px;
  display: flex;
  flex: 1;
  z-index: 1;
`
const StyledInput = styled.input`
  appearance: none;
  background-color: transparent;
  border: none;
  border-radius: 99px;
  box-sizing: border-box;
  box-shadow: ${shadows.sunk()}, ${shadows.drop()};
  color: ${colors.darkerGrey};
  display: block;
  font-size: 12px;
  padding: 0 1rem;
  transition: background-color 200ms ${easings.easeOut};
  outline: none;
  width: 100%;

  :hover {
    background-color: ${rgba(colors.lightGrey, 0.15)};
  }

  ${beaconRing(` + ${StyledInputOutline}`, '99px')}
`

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void
}

export const Input = ({ onChange, ...rest }: InputProps) => (
  <StyledInputWrapper>
    <StyledInput
      {...rest}
      onChange={useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
          if (onChange) {
            onChange(event.target.value)
          }
        },
        [onChange],
      )}
    />
    <StyledInputOutline />
  </StyledInputWrapper>
)
