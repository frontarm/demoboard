/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

// import { useMemo, useReducer, useRef } from 'react'
// import clamp from '../utils/clamp'

// const DefaultMobileCutoffWidth = 600
// const DefaultSingleCutoffWidth = 772

// /**
//  * The minimum height for any embedded demoboard
//  */
// const DefaultMinEmbeddedHeight = 200

// /**
//  * Total toolbar heights for each mode, used to calculate the default height.
//  */
// const DefaultChromeHeights = {
//   // The +10 is for the case of a horizontal scrollbar
//   mobile: 90 + 10,
//   single: 110 + 10,
//   double: 70 + 10,
// }
// const DefaultPanelChromeHeights = {
//   mobile: 2,
//   single: 2,
//   double: 2,
// }

// /**
//  * Line heights for each mode, used to calculate the default height.
//  */
// const DefaultLineHeights = {
//   mobile: 18,
//   single: 18,
//   double: 18,
// }

// export interface DemoboardViewModel extends DemoboardViewModelState {
//   actions: DemoboardViewModelActions
//   mode: DemoboardLayoutMode
// }

// export type DemoboardLayoutMode = 'mobile' | 'single' | 'double'
// export type DemoboardLayoutTab = 'editor' | 'viewer'
// export type DemoboardPanelType =
//   | 'console'
//   | 'transformedSource'
//   | 'solutionSource'
//   | 'originalSource'

// export interface DemoboardViewModelState {
//   height?: number

//   editorProportion?: number
//   leftPanelProportion?: number
//   rightPanelProportion?: number

//   fullScreen: boolean

//   leftPanelMaximized: boolean
//   rightPanelMaximized: boolean
//   sidebar: boolean

//   tab: DemoboardLayoutTab
//   leftPanel: DemoboardPanelType | null
//   rightPanel: DemoboardPanelType | null
// }

// export type DemoboardViewModelAction =
//   | { type: 'set'; state: Partial<DemoboardViewModelState> }
//   | { type: 'toggleLeftPanelMaximized' }
//   | { type: 'toggleRightPanelMaximized' }
//   | { type: 'toggleFullScreen' }
//   | { type: 'toggleSidebar' }
//   | { type: 'toggleLeftTransformedSource' }
//   | { type: 'toggleLeftSolutionSource' }
//   | { type: 'toggleLeftOriginalSource' }
//   | { type: 'toggleRightConsole' }

// export type DemoboardViewModelActions = ReturnType<
//   typeof createDemoboardViewModelActions
// >

// export interface UseDemoboardViewModelOptions {
//   /**
//    * The width of the Demoboard container. Note that this may depend on the
//    * styles of the demoboard itself, so you should *not* set the width
//    * based on this variable.
//    */
//   containerWidth: number

//   /**
//    * The width of the browser's client area
//    */
//   clientWidth: number

//   /**
//    * The height of the browser's client area
//    */
//   clientHeight: number

//   /**
//    * Whether the left panel should open in a maximized state by default.
//    * Defaults to true.
//    */
//   initialLeftPanelMaximized?: boolean

//   /**
//    * Whether the right panel should open in a maximized state by default.
//    * Defaults to false.
//    */
//   initialRightPanelMaximized?: boolean

//   /**
//    * When on smaller screens, this tab will be displayed by default.
//    */
//   initialTab?: 'editor' | 'viewer'

//   /**
//    * If specified, a panel on the left-hand side will be open by default.
//    */
//   initialLeftPanel?: DemoboardPanelType

//   /**
//    * If specified, a panel on the right-hand side will be open by default.
//    */
//   initialRightPanel?: DemoboardPanelType

//   /**
//    * If specified, this will be used to set the default height of an embedded
//    * demoboard, in number of lines.
//    */
//   initialSize?: number

//   /**
//    * Used to decide the number of lines.
//    */
//   initialSource: string

//   /**
//    * Indicates whether the layout should take up the full browser viewport.
//    */
//   fullScreen?: boolean
// }

// export default function useDemoboardViewModel(
//   options: UseDemoboardViewModelOptions,
// ): DemoboardViewModel {
//   let [state, dispatch] = useReducer(
//     demoboardViewModelReducer,
//     options,
//     demoboardViewModelInit,
//   )

//   let actionsRef = useRef<DemoboardViewModelActions>()
//   if (!actionsRef.current) {
//     actionsRef.current = createDemoboardViewModelActions(dispatch)
//   }

//   const width = state.fullScreen ? options.clientWidth : options.containerWidth
//   const mode: DemoboardLayoutMode =
//     width < DefaultMobileCutoffWidth
//       ? 'mobile'
//       : width < DefaultSingleCutoffWidth
//       ? 'single'
//       : 'double'

//   // If the user has not specified a custom height, calculate the default
//   // based on document heights and the default selected panels
//   let height = state.height
//   if (height === null) {
//     if (state.fullScreen) {
//       height = options.clientHeight
//     } else {
//       let defaultContentHeight =
//         DefaultChromeHeights[mode] +
//         DefaultLineHeights[mode] * this.defaultLineCount +
//         DefaultPanelChromeHeights[mode] * (this.defaultSplitCount - 1)

//       if (this.props.defaultLeftPanel) {
//         defaultContentHeight *= 2
//       }

//       height = clamp(
//         DefaultMinEmbeddedHeight,
//         defaultContentHeight,
//         options.clientHeight * 0.9,
//       )
//     }
//   }

//   let viewModel = useMemo(
//     () => ({
//       ...state,
//       height,
//       mode,
//       actions: actionsRef.current,
//     }),
//     Object.keys(state).concat('mode', 'height'),
//   )

//   return viewModel
// }

// function demoboardViewModelInit(
//   options: UseDemoboardViewModelOptions,
// ): DemoboardViewModelState {
//   let {
//     initialTab = 'editor' as 'editor',
//     initialLeftPanelMaximized = true,
//     initialRightPanelMaximized = false,
//     initialSize,
//   } = options

//   // Calculate the default number of lines and panels, as we'll use this to
//   // set the default document size
//   if (!initialSize) {
//     const source = options.initialSource
//     initialSize = source ? source.split('\n').length : 0
//   }

//   return {
//     leftPanelMaximized: initialLeftPanelMaximized,
//     rightPanelMaximized: initialRightPanelMaximized,
//     fullScreen: options.fullScreen,
//     sidebar: false,

//     tab: initialTab,
//     leftPanel: options.initialLeftPanel,
//     rightPanel: options.initialRightPanel,
//   }
// }

// function demoboardViewModelReducer(
//   state: DemoboardViewModelState,
//   action: DemoboardViewModelAction,
// ): DemoboardViewModelState {
//   switch (action.type) {
//     case 'set':
//       return {
//         ...state,
//         ...action.state,
//       }
//     case 'toggleLeftPanelMaximized':
//       return {
//         ...state,
//         leftPanelMaximized: !state.leftPanelMaximized,
//       }
//     case 'toggleRightPanelMaximized':
//       return {
//         ...state,
//         rightPanelMaximized: !state.rightPanelMaximized,
//       }
//     case 'toggleFullScreen':
//       return {
//         ...state,
//         fullScreen: !state.fullScreen,
//       }
//     case 'toggleSidebar':
//       return {
//         ...state,
//         sidebar: !state.sidebar,
//       }
//     case 'toggleLeftTransformedSource':
//       return {
//         ...state,
//         leftPanel:
//           state.leftPanel !== 'transformedSource' ? 'transformedSource' : null,
//       }
//     case 'toggleLeftSolutionSource':
//       return {
//         ...state,
//         leftPanel:
//           state.leftPanel !== 'solutionSource' ? 'solutionSource' : null,
//       }
//     case 'toggleLeftOriginalSource':
//       return {
//         ...state,
//         leftPanel:
//           state.leftPanel !== 'originalSource' ? 'originalSource' : null,
//       }
//     case 'toggleRightConsole':
//       return {
//         ...state,
//         rightPanel: state.rightPanel !== 'console' ? 'console' : null,
//       }
//     default:
//       return state
//   }
// }

// function createDemoboardViewModelActions(
//   dispatch: (action: DemoboardViewModelAction) => void,
// ) {
//   let set = (state: Partial<DemoboardViewModelState>) => {
//     dispatch({ type: 'set', state })
//   }

//   return {
//     toggleFullScreen: () => {
//       dispatch({ type: 'toggleFullScreen' })
//     },
//     changeDimensions: ({ width, height }) => {
//       set({ height })
//     },

//     selectEditor: () => {
//       set({ tab: 'editor' })
//     },
//     selectViewer: () => {
//       set({ tab: 'viewer' })
//     },

//     toggleTransformedSource: () => {
//       dispatch({ type: 'toggleLeftTransformedSource' })
//     },
//     toggleSolutionSource: () => {
//       dispatch({ type: 'toggleLeftSolutionSource' })
//     },
//     toggleOriginalSource: () => {
//       dispatch({ type: 'toggleLeftOriginalSource' })
//     },
//     closeLeftPanel: () => {
//       set({ leftPanel: undefined })
//     },
//     toggleLeftPanelMaximized: () => {
//       dispatch({ type: 'toggleLeftPanelMaximized' })
//     },

//     toggleConsole: () => {
//       dispatch({ type: 'toggleRightConsole' })
//     },
//     closeRightPanel: () => {
//       set({ rightPanel: undefined })
//     },
//     toggleRightPanelMaximized: () => {
//       dispatch({ type: 'toggleRightPanelMaximized' })
//     },
//   }
// }
