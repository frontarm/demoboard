/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { css } from 'styled-components'
import { colors } from '../../constants'
import cleanUpPathname from '../../utils/cleanUpPathname'

export interface BuildErrorProps extends React.ComponentProps<'div'> {
  error: any
}

export function BuildError({ error, ...rest }: BuildErrorProps) {
  let title = 'Build failed'
  let description

  console.error(error)

  switch (error && error.name) {
    case 'TransformError':
      title = 'Syntax Error'
      description = (
        <div>
          <p>
            The file <strong>{cleanUpPathname(error.sourceFile)}</strong> could
            not be compiled.
          </p>
          {error.lineNumber && (
            <p>
              There was unexpected input around{' '}
              <strong>line {error.lineNumber}</strong>.
            </p>
          )}
          <pre>{error.message}</pre>
        </div>
      )
      break

    case 'FileNotFoundError':
      title = "A file you've referenced doesn't exist"
      description = (
        <div>
          <p>
            The file <strong>{cleanUpPathname(error.sourceFile)}</strong> refers
            to unknown file <strong>{cleanUpPathname(error.request)}</strong>.
          </p>
        </div>
      )
      break

    case 'FetchFailedError':
      title = 'Could not fetch dependency'
      description = (
        <div>
          <p>{error.message}</p>
        </div>
      )
      break

    default:
      console.error(error)
      description = <p>Something went wrong while building your app.</p>
  }

  return (
    <div
      css={css`
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        overflow: auto;
        background-color: white;
        padding: 8px;

        pre {
          color: ${colors.darkerGrey};
        }

        p,
        pre,
        .title {
          width: auto;
        }
      `}
      {...rest}>
      <h1
        css={css`
          color: ${colors.red};
          font-size: 32px;
          margin-top: 8px;
          margin-bottom: 8px;
          width: auto;
        `}>
        {title}
      </h1>
      <div>{description}</div>
    </div>
  )
}
