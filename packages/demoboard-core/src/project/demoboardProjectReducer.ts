/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { applyChanges, change, Text, Proxy } from 'automerge'
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
  createHistoryLocation,
  pushLocation,
} from '../utils/history'

function updateView(
  state: DemoboardProjectState,
  callback: (value: Proxy<DemoboardProjectView>) => void,
): DemoboardProjectState<any> {
  let commitMessage = Date.now()
  return {
    ...state,
    view: change(state.view, String(commitMessage), callback),
  }
}

function updateData(
  state: DemoboardProjectState,
  callback: (value: Proxy<DemoboardProjectData>) => void,
): DemoboardProjectState<any> {
  let commitMessage = Date.now()
  return {
    ...state,
    data: change(state.data, String(commitMessage), callback),
  }
}

function closeTab(state: DemoboardProjectState, pathname: string) {
  return updateView(state, view => {
    let selectedPathnameIndex = state.view.selectedTab
      ? view.tabs.indexOf(state.view.selectedTab)
      : -1

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

function openTab(state: DemoboardProjectState, pathname: string) {
  return updateView(state, view => {
    if (view.tabs.indexOf(pathname) === -1) {
      let selectedPathnameIndex = state.view.selectedTab
        ? view.tabs.indexOf(state.view.selectedTab)
        : -1
      view.tabs.splice(selectedPathnameIndex + 1, 0, pathname)
    }
    view.selectedTab = pathname
  })
}

function selectTab(state: DemoboardProjectState, pathname: string | null) {
  return updateView(state, view => {
    view.selectedTab = pathname
  })
}

function setTabs(
  state: DemoboardProjectState,
  pathnames: string[],
  selectedPathname?: string | null,
) {
  return updateView(state, view => {
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
  pathname: string,
  codeMirrorDoc: CodeMirrorDoc,
  codeMirrorChanges: CodeMirrorChange[] = [],
) {
  let source = state.data.sources[pathname]

  if (!(source instanceof Text)) {
    if (codeMirrorDoc && source) {
      return replaceSources(
        state,
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
        'Invariant violation: cannot change a generated source without passing in a codeMirrorDoc and a generator',
      )
    }
  }

  if (codeMirrorChanges.length === 0) {
    return state
  }

  return {
    ...updateData(state, data => {
      const text = data.sources[pathname] as Text

      for (let change of codeMirrorChanges) {
        const startPos = codeMirrorDoc.indexFromPos(change.from)
        const removedLines = change.removed || ['']
        const addedLines = change.text
        const removedLength =
          removedLines.reduce(
            (sum, remove) => sum + Array.from(remove).length + 1,
            0,
          ) - 1

        if (removedLength > 0) {
          text.deleteAt!(startPos, removedLength)
        }

        const addedText = addedLines.join('\n')
        if (addedText.length > 0) {
          text.insertAt!(startPos, ...Array.from(addedText))
        }
      }
    }),
    unpersistedCodeMirrorDocs: {
      ...state.unpersistedCodeMirrorDocs,
      [pathname]: codeMirrorDoc,
    },
  }
}

function deleteSource(state: DemoboardProjectState, pathname: string) {
  let unpersistedCodeMirrorDocs = state.unpersistedCodeMirrorDocs
  if (pathname in unpersistedCodeMirrorDocs) {
    unpersistedCodeMirrorDocs = { ...unpersistedCodeMirrorDocs }
    delete unpersistedCodeMirrorDocs[pathname]
  }
  return {
    ...updateData(state, data => {
      delete data.sources[pathname]
    }),
    unpersistedCodeMirrorDocs,
  }
}

function replaceSources(
  state: DemoboardProjectState,
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
    ...updateData(state, data => {
      for (let [pathname, { source, codeMirrorDoc }] of Object.entries(files)) {
        if (codeMirrorDoc) {
          unpersistedCodeMirrorDocs[pathname] = codeMirrorDoc
        }

        if (!merge) {
          data.sources = {}
        }

        if (typeof source !== 'string') {
          data.sources[pathname] = source
        } else {
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
      : updateView(state, view => {
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

    case 'data.applyChanges':
      return {
        ...state,
        data: applyChanges(state.data, action.changes),
      }

    case 'data.replace':
      return {
        ...state,
        data: action.data,
      }

    case 'tabs.close':
      return closeTab(state, state.view.selectedTab || action.pathname)

    case 'tabs.open':
      return openTab(state, action.pathname)

    case 'tabs.select':
      return selectTab(state, action.pathname)

    case 'tabs.set':
      return setTabs(state, action.pathnames, action.selectedPathname)

    case 'sources.create':
      return openTab(
        replaceSources(
          state,
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
        action.pathname,
      )

    case 'sources.change':
      return changeSource(
        state,
        action.pathname,
        action.codeMirrorDoc,
        action.codeMirrorChanges,
      )

    case 'sources.delete':
      return deleteSource(closeTab(state, action.pathname), action.pathname)

    case 'sources.merge':
      return replaceSources(state, action.files, {
        merge: true,
      })

    case 'sources.replace':
      return replaceSources(state, action.files, {
        merge: false,
      })

    case 'activeTemplate.set':
      return updateView(state, view => {
        view.activeTemplate = action.activeTemplate
      })

    case 'dependencies.set':
      return updateData(state, data => {
        Object.assign(data.dependencies, action.dependencies)
      })

    case 'metadata.set':
      return updateData(state, data => {
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
      return updateView(state, view => {
        let index = view.panelPriorityOrder.indexOf(action.panel)
        if (index !== -1) {
          view.panelPriorityOrder.splice(index, 1)
          view.panelPriorityOrder.unshift(action.panel)
        }
      })

    case 'panels.prioritize':
      return updateView(state, view => {
        let index = view.panelPriorityOrder.indexOf(action.panel)
        if (index !== -1) {
          view.panelPriorityOrder.splice(index, 1)
        }
        view.panelPriorityOrder.push(action.panel)
      })

    case 'panels.remove':
      return updateView(state, view => {
        let index = view.panelPriorityOrder.indexOf(action.panel)
        if (index !== -1) {
          view.panelPriorityOrder.splice(index, 1)
        }
      })

    case 'history.setLocationBar':
      return updateView(state, view => {
        view.locationBar = action.value
      })

    case 'history.traverse':
      return updateView(state, view => {
        let newHistory = go(view.history, action.count)
        view.history = newHistory
        view.locationBar = getCurrentLocation(newHistory).uri
      })

    case 'history.go':
      return updateView(state, view => {
        let url = action.url || view.locationBar || '/'
        if (url.indexOf('//') === -1 && url[0] !== '/') {
          url = '/' + url
        }

        const location = createHistoryLocation(url, false)
        const history = view.history

        view.history = pushLocation(history, location)
        view.locationBar = location.uri
      })

    case 'history.refresh':
      return updateView(state, view => {
        const history = view.history
        const location = history.locations[history.index]
        if (location.skipRender) {
          location.skipRender = false
        }
        location.refreshCount++
      })

    case 'history.set':
      return updateView(state, view => {
        view.history = action.history
        view.locationBar = getCurrentLocation(action.history).uri
      })

    default:
      return state
  }
}
