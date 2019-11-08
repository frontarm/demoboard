/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React, { useCallback } from 'react'
import { useRoverState } from 'reakit/Rover'
import { useId } from 'reakit-utils'
import styled, { css } from 'styled-components'
import { Tab, TabList } from 'reakit/Tab'
import { colors, fonts } from '../constants'
import { DemoboardProject } from '@frontarm/demoboard-core'

const StyledTabList = styled(TabList)`
  align-items: center;
  display: flex;
  overflow: hidden;
  width: 100%;
`

const StyledTab = styled(Tab)`
  flex: 1 0 0;
  background-color: transparent;
  display: block;
  width: 100%;
  padding: 0px 10px;
  line-height: 40px;
  outline: none;
  cursor: pointer;
  opacity: 0.5;
  font-size: 0.85rem;
  white-space: nowrap;
  position: relative;
  user-select: none;

  margin-bottom: 0;
  cursor: pointer;
  user-select: none;
  font-family: ${fonts.sansSerif};

  border: none;
  color: ${colors.black};
  width: 0;
  overflow: hidden;

  &:first-child {
    padding-left: 20px;
  }

  &:hover {
    background-color: ${colors.lighterGrey};
  }

  ${props =>
    props.selectedId === props.stopId &&
    css`
      opacity: 1;
      background-color: ${colors.lighterGrey};
      cursor: default;
      width: 100%;
      overflow: visible;
      padding-right: 32px;
    `}
`

export interface OpenTabListProps {
  project: DemoboardProject
}

export function OpenTabList({ project }: OpenTabListProps) {
  const {
    dispatch,
    state: { view },
  } = project
  const selectedTab = view.selectedTab
  const baseId = useId('tab-')
  const rover = useRoverState({
    loop: true,
    currentId: selectedTab,
  })
  const handleSelectTab = useCallback(
    (pathname: string | null) => {
      dispatch({
        type: 'tabs.select',
        pathname,
      })
    },
    [dispatch],
  )
  const tab = {
    ...rover,
    unstable_baseId: baseId,
    selectedId: selectedTab,
    select: handleSelectTab,
  }

  return (
    <StyledTabList {...tab} aria-label="Open files">
      {view.tabs.map(pathname => (
        <StyledTab {...tab} key={pathname} stopId={pathname}>
          {pathname.slice(1)}
        </StyledTab>
      ))}
    </StyledTabList>
  )
}
