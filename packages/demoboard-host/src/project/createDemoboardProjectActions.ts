/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

// import {
//   EditorChange as CodeMirrorChange,
//   Doc as CodeMirrorDoc,
// } from 'codemirror'
// import {
//   DemoboardHistory,
//   DemoboardPanelType,
//   DemoboardProjectAction,
//   DemoboardProjectActions,
// } from '../types'

// export function createProjectActions<
//   PanelType extends DemoboardPanelType = DemoboardPanelType
// >(
//   dispatch: (action: DemoboardProjectAction<PanelType>) => void,
//   userId: null | string,
// ): DemoboardProjectActions<PanelType> {
//   return {
//     changeSource: (
//       pathname: string,
//       codeMirrorChanges: CodeMirrorChange[],
//       codeMirrorDoc: CodeMirrorDoc,
//     ) => {
//       dispatch({
//         type: 'sources.change',
//         userId,
//         pathname,
//         codeMirrorChanges,
//         codeMirrorDoc,
//       })
//     },
//     createSource: (pathname: string, initialContent?: string) => {
//       dispatch({
//         type: 'sources.create',
//         pathname,
//         initialContent,
//       })
//     },
//     deleteSource: (pathname: string) => {
//       dispatch({
//         type: 'deleteSource',
//         pathname,
//       })
//     },
//     replaceSources: (changes: {
//       [pathname: string]: {
//         source: string
//         editorModel?: any
//       }
//     }) => {},

//     closeTab: (pathname: string) => {
//       dispatch({
//         type: 'closeTab',
//         pathname,
//       })
//     },
//     openTab: (pathname: string) => {
//       dispatch({
//         type: 'openTab',
//         pathname,
//       })
//     },
//     selectTab: (pathname: string) => {
//       dispatch({
//         type: 'selectTab',
//         pathname,
//       })
//     },
//     setTabs: (pathnames: string[]) => {
//       dispatch({
//         type: 'setTabs',
//         pathnames,
//       })
//     },

//     setMetadata: (metadata: { [key: string]: string }) => {},

//     setHistory: (history: DemoboardHistory) => {},
//     historyGo: (distance: number) => {},
//     historyPush: (url: string) => {},

//     prioritizePanel: (panel: PanelType) => {},
//     deprioritizePanel: (panel: PanelType) => {},
//     removePanelPriority: (panel: PanelType) => {},
//   }
// }
