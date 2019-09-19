/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { change, Text, Proxy } from 'automerge'
import {
  EditorChange as CodeMirrorChange,
  Doc as CodeMirrorDoc,
} from 'codemirror'
import {
  DemoboardPanelType,
  DemoboardProjectState,
  DemoboardProjectAction,
  DemoboardGeneratedFile,
  DemoboardProjectView,
  DemoboardProjectData,
} from '../types'
import {
  go,
  getCurrentLocation,
  replaceLocation,
  createHistoryLocation,
  pushLocation,
} from '../utils/history'

function updateView(
  state: DemoboardProjectState,
  userId: null | string,
  callback: (value: Proxy<DemoboardProjectView>) => void,
): DemoboardProjectState<any> {
  let commitMessage = Date.now() + '-' + (userId || '')
  return {
    ...state,
    view: change(state.view, commitMessage, callback),
  }
}

function updateData(
  state: DemoboardProjectState,
  userId: null | string,
  callback: (value: Proxy<DemoboardProjectData>) => void,
): DemoboardProjectState<any> {
  let commitMessage = Date.now() + '-' + (userId || '')
  return {
    ...state,
    data: change(state.data, commitMessage, callback),
  }
}

function closeTab(
  state: DemoboardProjectState,
  userId: null | string,
  pathname: string,
) {
  return updateView(state, userId, view => {
    let selectedPathnameIndex = view.tabs.indexOf(pathname)

    view.tabs.splice(selectedPathnameIndex, selectedPathnameIndex)

    // If we just removed the selected tab, then let's try and select
    // another tab
    if (pathname && view.tabs.indexOf(pathname) === -1) {
      let newSelectedTabIndex = Math.min(
        selectedPathnameIndex,
        view.tabs.length - 1,
      )
      view.selectedTab =
        newSelectedTabIndex === -1 ? null : view.tabs[newSelectedTabIndex]
    }
  })
}

function openTab(
  state: DemoboardProjectState,
  userId: null | string,
  pathname: string,
) {
  return updateView(state, userId, view => {
    if (view.tabs.indexOf(pathname) === -1) {
      let selectedPathnameIndex = view.tabs.indexOf(pathname) || -1
      view.tabs.splice(selectedPathnameIndex + 1, 0, pathname)
    }
    view.selectedTab = pathname
  })
}

function selectTab(
  state: DemoboardProjectState,
  userId: null | string,
  pathname: string,
) {
  return updateView(state, userId, view => {
    view.selectedTab = pathname
  })
}

function setTabs(
  state: DemoboardProjectState,
  userId: null | string,
  pathnames: string[],
  selectedPathname?: string | null,
) {
  return updateView(state, userId, view => {
    let previouslySelectedTab = view.selectedTab
    let selectedPathnameIndex =
      (view.selectedTab !== null && view.tabs.indexOf(view.selectedTab)) || -1

    view.tabs = pathnames

    if (selectedPathname !== undefined) {
      view.selectedTab = selectedPathname
    }
    // If we just removed the selected tab, then let's try and select
    // another tab near the same index
    else if (
      previouslySelectedTab &&
      view.tabs.indexOf(previouslySelectedTab) === -1
    ) {
      let newSelectedTabIndex = Math.min(
        selectedPathnameIndex,
        view.tabs.length - 1,
      )
      view.selectedTab =
        newSelectedTabIndex === -1 ? null : view.tabs[newSelectedTabIndex]
    }
  })
}

function changeSource(
  state: DemoboardProjectState,
  userId: null | string,
  pathname: string,
  codeMirrorDoc: CodeMirrorDoc,
  codeMirrorChanges: CodeMirrorChange[] = [],
) {
  if (!state.data.sources[pathname]) {
    if (codeMirrorDoc && state.data.generatedSources[pathname]) {
      return replaceSources(
        state,
        userId,
        {
          [pathname]: {
            source: codeMirrorDoc.getValue().toString(),
            codeMirrorDoc,
          },
        },
        {
          merge: true,
        },
      )
    } else {
      throw new Error(
        'Invariant violation: cannot change a generated source without passing in a codeMirrorDoc',
      )
    }
  }

  if (codeMirrorChanges.length === 0) {
    return state
  }

  return {
    ...updateData(state, userId, data => {
      const text = data.sources[pathname]

      for (let change of codeMirrorChanges) {
        const startPos = codeMirrorDoc.indexFromPos(change.from)
        const removedLines = change.removed || []
        const addedLines = change.text
        const removedLength =
          removedLines.reduce((sum, remove) => sum + remove.length + 1, 0) - 1

        if (removedLength > 0) {
          text.splice(startPos, removedLength)
        }

        const addedText = addedLines.join('\n')
        if (addedText.length > 0) {
          text.splice(startPos, 0, ...addedText.split(''))
        }
      }
    }),
    unpersistedCodeMirrorDocs: {
      ...state.unpersistedCodeMirrorDocs,
      [pathname]: codeMirrorDoc,
    },
  }
}

function deleteSource(
  state: DemoboardProjectState,
  userId: null | string,
  pathname: string,
) {
  let unpersistedCodeMirrorDocs = state.unpersistedCodeMirrorDocs
  if (pathname in unpersistedCodeMirrorDocs) {
    unpersistedCodeMirrorDocs = { ...unpersistedCodeMirrorDocs }
    delete unpersistedCodeMirrorDocs[pathname]
  }
  return {
    ...updateData(state, userId, data => {
      delete data.sources[pathname]
    }),
    unpersistedCodeMirrorDocs,
  }
}

function replaceSources(
  state: DemoboardProjectState,
  userId: null | string,
  files: {
    [pathname: string]: {
      /**
       * If a generated file is supplied, then this will become a
       * generated file instead of a standard source.
       */
      source: string | DemoboardGeneratedFile
      codeMirrorDoc?: CodeMirrorDoc
    }
  },
  { merge = false }: { merge: boolean },
) {
  let entries = Object.entries(files)
  if (entries.length === 0) {
    return state
  }

  let unpersistedCodeMirrorDocs = { ...state.unpersistedCodeMirrorDocs }
  return {
    ...updateData(state, userId, data => {
      for (let [pathname, { source, codeMirrorDoc }] of Object.entries(files)) {
        if (codeMirrorDoc) {
          unpersistedCodeMirrorDocs[pathname] = codeMirrorDoc
        }

        if (!merge) {
          data.generatedSources = {}
          data.sources = {}
        }

        if (typeof source !== 'string') {
          if (data.sources[pathname]) {
            delete data.sources[pathname]
          }
          data.generatedSources[pathname] = source
        } else {
          if (data.generatedSources[pathname]) {
            delete data.generatedSources[pathname]
          }
          let text = new Text()
          if (source.length) {
            text.insertAt!(0, ...source)
          }
          data.sources[pathname] = text
        }
      }
    }),
    ...(merge
      ? state.view
      : updateView(state, userId, view => {
          let pathnames = Object.keys(files)
          let originalTabs = view.tabs
          let originalSelectedTab = view.selectedTab
          let originalSelectedTabIndex =
            (originalSelectedTab &&
              originalTabs.indexOf(originalSelectedTab)) ||
            -1

          // Remove any tabs which are no longer available
          view.tabs = originalTabs.filter(tab => pathnames.indexOf(tab) !== -1)

          // If the selected tab has disappeared, select one as close to the
          // original index as possible
          if (
            originalSelectedTab !== null &&
            pathnames.indexOf(originalSelectedTab) === -1
          ) {
            let newSelectedTabIndex = Math.min(
              originalSelectedTabIndex,
              view.tabs.length - 1,
            )
            view.selectedTab =
              newSelectedTabIndex === -1 ? null : view.tabs[newSelectedTabIndex]
          }
        })),
    unpersistedCodeMirrorDocs,
  }
}

export default function demoboardProjectReducer<
  PanelType extends DemoboardPanelType = DemoboardPanelType
>(
  state: DemoboardProjectState<PanelType>,
  action: DemoboardProjectAction<PanelType>,
): DemoboardProjectState<PanelType> {
  switch (action.type) {
    case 'reset':
      return action.state

    case 'tabs.close':
      return closeTab(
        state,
        action.userId,
        state.view.selectedTab || action.pathname,
      )

    case 'tabs.open':
      return openTab(state, action.userId, action.pathname)

    case 'tabs.select':
      return selectTab(state, action.userId, action.pathname)

    case 'tabs.set':
      return setTabs(
        state,
        action.userId,
        action.pathnames,
        action.selectedPathname,
      )

    case 'sources.create':
      return selectTab(
        replaceSources(
          state,
          action.userId,
          {
            [action.pathname]: {
              source: action.source,
              codeMirrorDoc: action.codeMirrorDoc,
            },
          },
          {
            merge: true,
          },
        ),
        action.userId,
        action.pathname,
      )

    case 'sources.change':
      return changeSource(
        state,
        action.userId,
        action.pathname,
        action.codeMirrorDoc,
        action.codeMirrorChanges,
      )

    case 'sources.delete':
      return deleteSource(
        closeTab(state, action.userId, action.pathname),
        action.userId,
        action.pathname,
      )

    case 'sources.merge':
      return replaceSources(state, action.userId, action.files, {
        merge: true,
      })

    case 'sources.replace':
      return replaceSources(state, action.userId, action.files, {
        merge: false,
      })

    case 'activeTemplate.set':
      return updateView(state, action.userId, view => {
        view.activeTemplate = action.activeTemplate
      })

    case 'dependencies.set':
      return updateData(state, action.userId, data => {
        Object.assign(data.dependencies, action.dependencies)
      })

    case 'metadata.set':
      return updateData(state, action.userId, data => {
        for (let existingKey of Object.keys(data.metadata)) {
          if (!(existingKey in data.metadata)) {
            delete data.metadata[existingKey]
          }
        }
        for (let key of Object.keys(action.metadata)) {
          data.metadata[key] = new Text()
          data.metadata[key].insertAt!(0, ...action.metadata[key])
        }
      })

    case 'panels.deprioritize':
      return updateView(state, action.userId, view => {
        let index = view.panelPriorityOrder.indexOf(action.panel)
        if (index !== -1) {
          view.panelPriorityOrder.splice(index, 1)
          view.panelPriorityOrder.unshift(action.panel)
        }
      })

    case 'panels.prioritize':
      return updateView(state, action.userId, view => {
        let index = view.panelPriorityOrder.indexOf(action.panel)
        if (index !== -1) {
          view.panelPriorityOrder.splice(index, 1)
        }
        view.panelPriorityOrder.push(action.panel)
      })

    case 'panels.remove':
      return updateView(state, action.userId, view => {
        let index = view.panelPriorityOrder.indexOf(action.panel)
        if (index !== -1) {
          view.panelPriorityOrder.splice(index, 1)
        }
      })

    case 'history.setLocationBar':
      return updateView(state, action.userId, view => {
        view.locationBar = action.value
      })

    case 'history.traverse':
      return updateView(state, action.userId, view => {
        let newHistory = go(view.history, action.count)
        view.history = newHistory
        view.locationBar = getCurrentLocation(newHistory).uri
      })

    case 'history.go':
      return updateView(state, action.userId, view => {
        let url = action.url || view.locationBar || '/'
        if (url.indexOf('//') === -1 && url[0] !== '/') {
          url = '/' + url
        }

        let location = createHistoryLocation(url, false)
        view.history = pushLocation(view.history, location)
        view.locationBar = location.uri
      })

    case 'history.refresh':
      return updateView(state, action.userId, view => {
        let history = view.history
        let location = history.locations[history.index]
        view.history = replaceLocation(history, {
          ...location,
          skipRender: false,
          state: { ...location.state },
        })
      })

    case 'history.set':
      return updateView(state, action.userId, view => {
        view.history = action.history
        view.locationBar = getCurrentLocation(action.history).uri
      })

    default:
      return state
  }
}
