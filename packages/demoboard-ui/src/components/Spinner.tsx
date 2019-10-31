/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { css, keyframes } from 'styled-components'
import { colors } from '../constants'

export interface SpinnerProps extends React.ComponentProps<'div'> {
  color?: string
}

export function Spinner({ color = colors.black, ...rest }: SpinnerProps) {
  return (
    <div
      {...rest}
      css={css`
        display: inline-block;
        opacity: 0.5;
        width: 2rem;
        height: 2rem;
        margin-top: -1rem;
        margin-left: -1rem;
        position: relative;

        > svg {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-position: center;
          background-size: contain;
        }
      `}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        css={css`
          animation: ${spinKeyframes} 2.5s infinite linear;
        `}>
        <path
          fill={color}
          d="M157.34,98.4q-1.5-1.48-3.08-3a86.6,86.6,0,0,1-25.33-43.87q-.49-2.11-1-4.14C121.56,23,110.76,6.91,98.5,6.91S75.43,23,69.08,47.44q-.53,2-1,4.14A86.6,86.6,0,0,1,42.73,95.45q-1.58,1.48-3.08,3c-18,17.73-26.52,35.13-20.39,45.75s25.46,11.93,49.81,5.22q2-.56,4.1-1.19a86.6,86.6,0,0,1,50.65,0q2.07.63,4.1,1.19c24.35,6.71,43.68,5.4,49.81-5.22S175.33,116.13,157.34,98.4Zm-57.12,22.38a20.51,20.51,0,1,1,20.51-20.51A20.51,20.51,0,0,1,100.22,120.79Z"
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        css={css`
          opacity: 0.5;
          animation: ${spinKeyframes} 2.5s infinite reverse -0.25s linear;
        `}>
        <path
          fill={color}
          d="M157.34,98.4q-1.5-1.48-3.08-3a86.6,86.6,0,0,1-25.33-43.87q-.49-2.11-1-4.14C121.56,23,110.76,6.91,98.5,6.91S75.43,23,69.08,47.44q-.53,2-1,4.14A86.6,86.6,0,0,1,42.73,95.45q-1.58,1.48-3.08,3c-18,17.73-26.52,35.13-20.39,45.75s25.46,11.93,49.81,5.22q2-.56,4.1-1.19a86.6,86.6,0,0,1,50.65,0q2.07.63,4.1,1.19c24.35,6.71,43.68,5.4,49.81-5.22S175.33,116.13,157.34,98.4Zm-57.12,22.38a20.51,20.51,0,1,1,20.51-20.51A20.51,20.51,0,0,1,100.22,120.79Z"
        />
      </svg>
    </div>
  )
}

const spinKeyframes = keyframes`
  0% { transform: rotate(0deg) }
  15% { transform: rotate(60deg) }
  35% { transform: rotate(120deg) }
  50% { transform: rotate(180deg) }
  70% { transform: rotate(240deg) }
  85% { transform: rotate(300deg) }
  100% { transform: rotate(360deg) }
`
