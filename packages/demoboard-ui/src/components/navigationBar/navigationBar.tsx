/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React, { useCallback } from 'react'
import styled, { css } from 'styled-components'
import { DemoboardProject } from '@frontarm/demoboard-core'
import { IconButton } from '../iconButton'
import { Input } from '../input'
import { dimensions } from '../../constants'

export interface NavigationBarState {
  canGoBack: boolean
  canGoForward: boolean
  displayedLocation: string

  onNavigateForward: () => void
  onNavigateBack: () => void
  onRefresh: () => void
  onChangeDisplayedLocation: (value: string) => void
  onGoToDisplayedLocation: () => void
}

const StyledNavigationButton = styled(IconButton)`
  margin: 0 1px;
`

export type NavigationBarProps = React.HTMLAttributes<HTMLDivElement> &
  NavigationBarState

export function NavigationBar({
  canGoBack,
  canGoForward,
  displayedLocation,
  onNavigateForward,
  onNavigateBack,
  onRefresh,
  onChangeDisplayedLocation,
  onGoToDisplayedLocation,
  ...rest
}: NavigationBarProps) {
  return (
    <div
      {...rest}
      css={css`
        display: flex;
        align-items: center;
        padding: 0 3px;
        width: 100%;
      `}>
      <StyledNavigationButton
        disabled={!canGoBack}
        glyph="back"
        accessibilityLabel="Back"
        onClick={onNavigateBack}>
        Back
      </StyledNavigationButton>
      <StyledNavigationButton
        disabled={!canGoForward}
        glyph="forward"
        accessibilityLabel="Forward"
        onClick={onNavigateForward}>
        Forward
      </StyledNavigationButton>
      <StyledNavigationButton
        onClick={onRefresh}
        glyph="refresh"
        tooltip="Refresh">
        Refresh
      </StyledNavigationButton>
      <form
        onSubmit={event => {
          event.preventDefault()
          onGoToDisplayedLocation()
        }}
        css={css`
          display: flex;
          flex-grow: 1;
          margin-left: 4px;
        `}>
        <Input
          value={displayedLocation}
          onChange={onChangeDisplayedLocation}
          css={css`
            flex-grow: 1 1 100%;
            height: ${dimensions.raisedButtonHeight};
          `}
        />
      </form>
    </div>
  )
}

export function useProjectNavigationBarState(
  project: DemoboardProject,
): NavigationBarState {
  const {
    dispatch,
    state: {
      view: { locationBar },
    },
    navigation: { canGoBack, canGoForward },
  } = project

  const onNavigateBack = useCallback(() => {
    if (canGoBack) {
      dispatch({
        type: 'history.traverse',
        count: -1,
      })
    }
  }, [canGoBack, dispatch])

  const onNavigateForward = useCallback(() => {
    if (canGoForward) {
      dispatch({
        type: 'history.traverse',
        count: 1,
      })
    }
  }, [canGoForward, dispatch])

  const onRefresh = useCallback(() => {
    dispatch({
      type: 'history.refresh',
    })
  }, [dispatch])

  const onChangeDisplayedLocation = useCallback(
    event => {
      dispatch({
        type: 'history.setLocationBar',
        value: event.target.value,
      })
    },
    [dispatch],
  )

  const onGoToDisplayedLocation = useCallback(() => {
    dispatch({
      type: 'history.go',
    })
  }, [dispatch])

  return {
    canGoBack,
    canGoForward,
    displayedLocation: locationBar,

    onNavigateForward,
    onNavigateBack,
    onRefresh,
    onChangeDisplayedLocation,
    onGoToDisplayedLocation,
  }
}
