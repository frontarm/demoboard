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

  // I'm doing mutable stuff in an immutable history here because
  // creating a whole new object would trigger a re-render :-(
  nextLocation.popState = history.locations
    .slice(
      Math.min(history.index, nextIndex) + 1,
      Math.max(history.index, nextIndex) + 1,
    )
    .reduce((acc, item) => acc && item.skipRender, true as boolean)

  return {
    locations: history.locations,
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
    locations: history.locations.slice(0, history.index + 1).concat(location),
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
  if (location === history.locations[history.index]) {
    return history
  }

  return {
    locations: history.locations.slice(0, history.index).concat(location),
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

const parsePattern = /^((((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/

export function createHistoryLocation(
  uri: string,
  skipRender: boolean,
  state?: any,
): DemoboardHistoryLocation {
  let matches = parsePattern.exec(uri)
  if (!matches) {
    throw new Error('Tried to parse a non-URI object.')
  }
  return {
    pathname: matches[2],
    search: matches[6],
    hash: matches[7],
    state,
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
