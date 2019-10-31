/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import styled, { css } from 'styled-components'
import { Tab, TabList, TabOptions } from 'reakit/Tab'
import { colors, fonts } from '../constants'

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
    props.currentId === props.stopId &&
    css`
      opacity: 1;
      background-color: ${colors.lighterGrey};
      cursor: default;
      width: 100%;
      overflow: visible;
      padding-right: 32px;
    `}
`

export interface OpenTabListProps extends Omit<TabOptions, 'stopId'> {
  pathnames: string[]
}

export function OpenTabList({ pathnames, ...tabs }: OpenTabListProps) {
  return (
    <StyledTabList {...tabs} aria-label="Open files">
      {pathnames.map(pathname => (
        <StyledTab {...tabs} key={pathname} stopId={pathname}>
          {pathname.slice(1)}
        </StyledTab>
      ))}
    </StyledTabList>
  )
}
