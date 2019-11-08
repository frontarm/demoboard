/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React, { useCallback } from 'react'
import { Button } from 'reakit/Button'
import styled from 'styled-components'
import { DemoboardProject } from '@frontarm/demoboard-core'

export interface NavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  project: DemoboardProject
}

const StyledNavigation = styled.div``

const StyledNavigationButton = styled(Button)``

const StyledNavigationInput = styled.input``

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
    <StyledNavigation {...rest}>
      <StyledNavigationButton disabled={!canGoBack} onClick={handleBack}>
        Back
      </StyledNavigationButton>
      <StyledNavigationButton disabled={!canGoForward} onClick={handleForward}>
        Forward
      </StyledNavigationButton>
      <StyledNavigationButton onClick={handleRefresh}>
        Refresh
      </StyledNavigationButton>
      <form onSubmit={handleSubmit}>
        <StyledNavigationInput value={locationBar} onChange={handleChange} />
      </form>
    </StyledNavigation>
  )
}
