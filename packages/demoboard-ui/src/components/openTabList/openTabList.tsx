/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { useRoverState } from 'reakit/Rover'
import { useId } from 'reakit-utils'
import styled, { css } from 'styled-components'
import { Tab, TabList } from 'reakit/Tab'
import { colors, fonts, shadows, easings } from '../../constants'

const StyledTabList = styled(TabList)`
  align-items: center;
  display: flex;
  width: 100%;
`

const StyledTab = styled(Tab)`
  background-color: transparent;
  border: none;
  box-shadow: ${shadows.drop()};
  color: ${colors.black};
  cursor: pointer;
  cursor: pointer;
  display: block;
  flex: 1 0 0;
  font-family: ${fonts.sansSerif};
  font-size: 13px;
  line-height: 40px;
  margin-bottom: 0;
  opacity: 0.5;
  outline: none;
  overflow: hidden;
  padding: 0px 10px;
  position: relative;
  transition: background-color 200ms ${easings.easeOut},
    opacity 200ms ${easings.easeOut};
  user-select: none;
  white-space: nowrap;
  width: 0;

  &:first-child {
    padding-left: 20px;
  }

  &:hover {
    background-color: ${colors.lighterGrey};
  }

  ${props =>
    props.selectedId === props.stopId &&
    css`
      background-color: ${colors.lighterGrey};
      cursor: default;
      opacity: 1;
      overflow: visible;
      padding-right: 32px;
      width: 100%;
    `}
`

export interface OpenTabListProps {
  onClose: (pathname: string) => void
  onSelect: (pathname: string | null) => void
  selected: string | null
  tabs: string[]
}

export function OpenTabList({
  onSelect,
  onClose,
  selected,
  tabs,
}: OpenTabListProps) {
  const baseId = useId('open-tab-')
  const rover = useRoverState({
    loop: true,
    currentId: selected,
  })
  const tab = {
    ...rover,
    unstable_baseId: baseId,
    selectedId: selected,
    select: onSelect,
  }

  return (
    <StyledTabList {...tab} aria-label="Open files">
      {tabs.map(pathname => (
        <StyledTab {...tab} key={pathname} stopId={pathname}>
          {pathname.slice(1)}
        </StyledTab>
      ))}
    </StyledTabList>
  )
}
