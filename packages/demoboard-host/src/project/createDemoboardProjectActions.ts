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
// ): DemoboardProjectActions<PanelType> {
//   return {
//     addSource: (pathname: string, initialContent?: string) => {
//       dispatch({
//         type: 'addSource',
//         pathname,
//         initialContent,
//       })
//     },
//     changeSource: (
//       pathname: string,
//       codeMirrorChanges: CodeMirrorChange[],
//       codeMirrorDoc: CodeMirrorDoc,
//     ) => {
//       dispatch({
//         type: 'changeSource',
//         pathname,
//         codeMirrorChanges,
//         codeMirrorDoc,
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
