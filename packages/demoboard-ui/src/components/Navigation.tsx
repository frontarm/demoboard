/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React, { useCallback } from 'react'
import styled, { css } from 'styled-components'
import { DemoboardProject } from '@frontarm/demoboard-core'
import { IconButton } from './iconButton'
import { beaconRing, colors, dimensions, radii } from '../constants'

export interface NavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  project: DemoboardProject
}

const StyledNavigationButton = styled(IconButton)``

export function Navigation({ project, ...rest }: NavigationProps) {
  const {
    dispatch,
    state: {
      view: { locationBar },
    },
    navigation: { canGoBack, canGoForward },
  } = project

  const handleBack = useCallback(() => {
    if (canGoBack) {
      dispatch({
        type: 'history.traverse',
        count: -1,
      })
    }
  }, [canGoBack, dispatch])

  const handleForward = useCallback(() => {
    if (canGoForward) {
      dispatch({
        type: 'history.traverse',
        count: 1,
      })
    }
  }, [canGoForward, dispatch])

  const handleRefresh = useCallback(() => {
    dispatch({
      type: 'history.refresh',
    })
  }, [dispatch])

  const handleChange = useCallback(
    event => {
      dispatch({
        type: 'history.setLocationBar',
        value: event.target.value,
      })
    },
    [dispatch],
  )

  const handleSubmit = useCallback(
    event => {
      event.preventDefault()
      dispatch({
        type: 'history.go',
      })
    },
    [dispatch],
  )

  return (
    <div
      {...rest}
      css={css`
        display: flex;
        padding: 0 4px;
        width: 100%;
      `}>
      <StyledNavigationButton
        disabled={!canGoBack}
        glyph="back"
        accessibilityLabel="Back"
        onClick={handleBack}>
        Back
      </StyledNavigationButton>
      <StyledNavigationButton
        disabled={!canGoForward}
        glyph="forward"
        accessibilityLabel="Forward"
        onClick={handleForward}>
        Forward
      </StyledNavigationButton>
      <StyledNavigationButton
        onClick={handleRefresh}
        glyph="refresh"
        accessibilityLabel="Refresh">
        Refresh
      </StyledNavigationButton>
      <form
        onSubmit={handleSubmit}
        css={css`
          display: flex;
          flex-grow: 1;
          margin-left: 4px;
        `}>
        <input
          value={locationBar}
          onChange={handleChange}
          css={css`
            flex-grow: 1;

            height: ${dimensions.raisedButtonHeight};
            border-radius: ${radii.small};
            border: 1px solid ${colors.lightGrey};
            padding: 0 1em;
            outline: none;
            position: relative;
            color: ${colors.darkerGrey};
            z-index: 0;

            ${beaconRing('::after')}
          `}
        />
      </form>
    </div>
  )
}
