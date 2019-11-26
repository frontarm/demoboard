/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React, { useCallback } from 'react'
import styled, { css } from 'styled-components'
import { useRoverState } from 'reakit/Rover'
import { useId } from 'reakit-utils'
import { Tab, TabList } from 'reakit/Tab'
import { colors, dimensions, fonts, radii, shadows } from '../../constants'
import { DemoboardProject } from '@frontarm/demoboard-core'

const StyledTabList = styled(TabList)`
  align-items: center;
  justify-content: flex-start;
  display: flex;
  width: 100%;
`

const StyledTab = styled(Tab)`
  background-color: transparent;
  box-shadow: ${shadows.drop()};
  box-sizing: border-box;
  display: block;
  padding: 0px 20px;
  height: ${dimensions.footerHeight};
  line-height: calc(${dimensions.footerHeight} - 2px);
  outline: none;
  cursor: pointer;
  opacity: 0.5;
  font-size: 11px;
  white-space: nowrap;
  position: relative;
  user-select: none;

  margin-bottom: 0;
  cursor: pointer;
  user-select: none;
  font-family: ${fonts.sansSerif};

  border: none;
  color: ${colors.black};

  &:hover {
    background-color: hsla(0, 0%, 100%, 0.5);
    opacity: 0.75;
  }

  ${props =>
    props.selectedId === props.stopId &&
    css`
      opacity: 1 !important;
      background-color: hsla(0, 0%, 100%, 0.5);
      border-top: 2px solid ${colors.purple};
      cursor: default;
    `}
`

export interface PanelTabListProps {
  project: DemoboardProject
}

export function PanelTabList({ project }: PanelTabListProps) {
  const {
    dispatch,
    state: { view },
  } = project
  const selectedTab = 'Console'
  const baseId = useId('panel-tab-')
  const rover = useRoverState({
    loop: true,
    currentId: selectedTab,
  })
  const handleSelectTab = useCallback((pathname: string | null) => {
    // TODO
  }, [])
  const tab = {
    ...rover,
    unstable_baseId: baseId,
    selectedId: selectedTab,
    select: handleSelectTab,
  }

  return (
    <StyledTabList {...tab} aria-label="Open panels">
      <StyledTab {...tab} stopId="Docs">
        Instructions
      </StyledTab>
      <StyledTab {...tab} stopId="Console">
        Console
      </StyledTab>
    </StyledTabList>
  )
}
