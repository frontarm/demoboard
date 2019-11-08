/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardHistory, DemoboardHistoryLocation } from '../types'

export function back(history: DemoboardHistory) {
  return go(history, -1)
}

export function forward(history: DemoboardHistory) {
  return go(history, 1)
}

export function canGo(history: DemoboardHistory, relativeIndex: number) {
  const newIndex = history.index + relativeIndex
  return newIndex < history.locations.length && newIndex >= 0
}

export function go(
  history: DemoboardHistory,
  relativeIndex: number,
): DemoboardHistory {
  if (relativeIndex === 0) {
    return history
  }

  if (!canGo(history, relativeIndex)) {
    throw new Error('Cannot go to non-existent index in history.')
  }

  let nextIndex = history.index + relativeIndex
  let nextLocation = history.locations[nextIndex]

  nextLocation.popState = history.locations
    .slice(
      Math.min(history.index, nextIndex) + 1,
      Math.max(history.index, nextIndex) + 1,
    )
    .reduce((acc, item) => acc && item.skipRender, true as boolean)

  return {
    locations: history.locations.slice(0).map(x => ({ ...x })),
    index: nextIndex,
    lastRenderedIndex: nextLocation.skipRender
      ? history.lastRenderedIndex
      : nextIndex,
  }
}

export function pushLocation(
  history: DemoboardHistory,
  location: DemoboardHistoryLocation,
): DemoboardHistory {
  let nextIndex = history.index + 1
  return {
    locations: history.locations
      .slice(0, nextIndex)
      // Need to map for automerge to work
      .concat(location)
      .map(x => ({ ...x })),
    index: nextIndex,
    lastRenderedIndex: location.skipRender
      ? history.lastRenderedIndex
      : nextIndex,
  }
}

export function replaceLocation(
  history: DemoboardHistory,
  location: DemoboardHistoryLocation,
): DemoboardHistory {
  return {
    locations: history.locations
      .slice(0, history.index)
      .concat(location)
      .map(x => ({ ...x })),
    index: history.index,
    lastRenderedIndex: location.skipRender
      ? history.lastRenderedIndex
      : history.index,
  }
}

export function getCurrentLocation(history: DemoboardHistory) {
  return history.locations[history.index]
}

export function getLastRenderedLocation(history: DemoboardHistory) {
  return history.locations[history.lastRenderedIndex]
}

const parsePattern = /^((((\/?(?:[^/?#]+\/+)*)([^?#]*)))?(\?[^#]+)?)(#.*)?/

export function createHistoryLocation(
  uri: string,
  skipRender: boolean,
  state: string | null = null,
): DemoboardHistoryLocation {
  let matches = parsePattern.exec(uri)
  if (!matches) {
    throw new Error('Tried to parse a non-URI object.')
  }
  return {
    pathname: matches[2],
    search: matches[6] || null,
    hash: matches[7] || null,
    stringifiedState: state,
    refreshCount: 0,
    skipRender: !!skipRender,
    popState: false,
    uri,
  }
}

export function createHistory(uri: string): DemoboardHistory {
  return {
    locations: [createHistoryLocation(uri, false)],
    index: 0,
    lastRenderedIndex: 0,
  }
}
