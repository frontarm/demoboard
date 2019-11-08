/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import { useId } from 'reakit-utils'
import {
  useDemoboardBuild,
  useDemoboardInstance,
  useDemoboardProject,
  UseDemoboardProjectOptions,
} from '@frontarm/demoboard-core'
import { DemoboardUI, DemoboardUIGlobalStyles } from '@frontarm/demoboard-ui'
import CodeMirror from './CodeMirror'

export function DemoboardGlobalStyles() {
  return <DemoboardUIGlobalStyles />
}

export const defaultProps = {
  CodeMirror,
}

export interface DemoboardProps extends Omit<UseDemoboardProjectOptions, 'id'> {
  id?: string
  CodeMirror?: any
  width?: string | number
  height?: string | number
  style?: React.CSSProperties
  className?: string
}

export const Demoboard = (props: DemoboardProps = defaultProps) => {
  // Each demoboard managed by a single worker needs to have a unique id.
  // Given that a worker may be shared over multiple nested demoboards, we'll
  // want to scope our generated ids by demoboard id.
  const demoboard = (typeof window !== 'undefined' &&
    (window as any).demoboard) || {
    id: 'demoboard',
  }
  const defaultId = useId(demoboard.id + '-')

  const { id = defaultId, width, height, style, className, ...rest } = props
  const project = useDemoboardProject(rest)
  const build = useDemoboardBuild(id, project.buildConfig)
  const instance = useDemoboardInstance({
    build,
    history: project.state.view.history,
    pause: false,
    onChangeHistory: value => {
      project.dispatch({
        type: 'history.set',
        history: value,
      })
    },
  })

  return (
    <DemoboardUI
      CodeMirror={CodeMirror}
      className={className}
      style={style}
      build={build}
      instance={instance}
      project={project}
      layout={{
        width,
        height,
      }}
    />
  )
}

// import {
//   DemoboardModelState,
//   Demoboard,
//   DemoboardLayoutRendererProps,
//   DemoboardStorageRendererProps,
//   DemoboardSourcesDelegateSnapshot,
// } from './DemoboardModel'
// import { DemoboardLayout } from './DemoboardLayout'
// import { ClientDimensions } from './layout/ClientDimensions'
// import { Dimensions } from './layout/Dimensions'
// import { defaultDefaultSourcesFactory } from './defaultDefaultSourcesFactory'
// import { DemoboardForkSnapshot } from './DemoboardForker'
// import VisibilitySensor from 'react-visibility-sensor'

// export interface DemoboardWidgetRendererProps<Layout extends DemoboardLayout>
//   extends DemoboardModelState<Layout> {
//   className?: string
//   style?: React.CSSProperties
// }

// export interface DemoboardWidgetProps<Layout extends DemoboardLayout> {
//   cx?: any
//   className?: string
//   style?: React.CSSProperties

//   /**
//    * The sources files. This is required even if `renderStorage` is provided,
//    * as it is used by the "Reset" button.
//    */
//   defaultDocumentSources: { [name: string]: string }

//   /**
//    * The pathname of the file which the editor will initially display.
//    * Defaults to the first source file.
//    */
//   defaultEditorPathname?: string

//   /**
//    * The URL where the viewer will start. Defaults to `/`.
//    */
//   defaultViewerURL?: string

//   /**
//    * Allows you to generate default sources based on the existing sources.
//    * This is useful for generating a default index.html if one doesn't exist.
//    */
//   defaultSourcesFactory?: (pathnames: string[]) => { [name: string]: string }

//   skipBuild: boolean
//   isVisible?: boolean

//   /**
//    * Allows the demoboard to show solutions for specific files on request.
//    */
//   solutions?: { [name: string]: string }

//   /**
//    * When a filename matches this pattern, if you navigate to it, it's result
//    * will be displayed in an iframe. Otherwise, it'll be console-only.
//    */
//   notHeadlessPattern?: RegExp

//   render: (demoboard: DemoboardWidgetRendererProps<Layout>) => React.ReactNode

//   renderError: (
//     error: DemoboardWidgetErrorRendererProps<Layout>,
//   ) => React.ReactNode

//   /**
//    * A function that returns a Govern element that publishes objects that
//    * extends DemoboardLayout.
//    *
//    * The published object will be passed directly to the renderer, allowing
//    * different renderers to configure the demoboard with different layout
//    * info.
//    */
//   renderLayout: (
//     props: DemoboardLayoutRendererProps,
//   ) => Govern.GovernElement<Layout>

//   renderFork?: (props: {
//     sources: { [name: string]: string }
//   }) => Govern.GovernElement<DemoboardForkSnapshot>

//   /**
//    * If provided, allows the Demoboard to prompt on navigation when there
//    * are unsaved changes. The function should return another function to
//    * unblock navigation.
//    */
//   blockNavigation?: () => () => void

//   /**
//    * This can be used to configure persistence for the Demoboard's source.
//    */
//   renderSourcesDelegate?: (
//     props: DemoboardStorageRendererProps,
//   ) => Govern.GovernElement<DemoboardSourcesDelegateSnapshot>

//   /**
//    * This can be used to configure persistence for the Demoboard's control
//    * state.
//    */
//   renderControlDelegate?: (
//     props: DemoboardStorageRendererProps,
//   ) => Govern.GovernElement<DemoboardControlDelegateSnapshot>
// }

// export interface DemoboardWidgetErrorRendererProps<Layout> {
//   documentSources: { [name: string]: string }
//   layout: Layout
// }

// export interface DemoboardWidgetState {
//   error?: any
// }

// export namespace DemoboardWidget {
//   export type Props<Layout extends DemoboardLayout> = DemoboardWidgetProps<
//     Layout
//   >
// }

// export class DemoboardWidget<
//   Layout extends DemoboardLayout
// > extends React.Component<DemoboardWidgetProps<Layout>, DemoboardWidgetState> {
//   static defaultProps = {
//     notHeadlessPattern: /(\.(mdx?|html))|(\/[\w-]*)$/,
//     defaultSourcesFactory: defaultDefaultSourcesFactory,
//   }

//   failsafe: DemoboardModelState<Layout>

//   constructor(props) {
//     super(props)
//     this.state = {}
//   }

//   componentDidCatch() {
//     this.setState({
//       error: true,
//     })
//   }

//   // This records any information that we'll need to render the error screen.
//   handleFailsafe = (failsafe: DemoboardModelState<Layout>) => {
//     this.failsafe = failsafe
//   }

//   render() {
//     if (this.state.error) {
//       return this.props.renderError({
//         documentSources: this.failsafe.documentSources,
//         layout: this.failsafe.layout,
//       })
//     } else {
//       return (
//         <VisibilitySensor partialVisibility offset={{ top: 100, bottom: 100 }}>
//           {({ isVisible }) => (
//             <ClientDimensions>
//               {({ width, height }) => {
//                 let {
//                   children,
//                   className,
//                   style,
//                   cx,
//                   render,
//                   renderError,
//                   ...demoboardProps
//                 } = this.props
//                 let clientDimensions = {
//                   clientWidth: width,
//                   clientHeight: height,
//                 }
//                 return (
//                   <Dimensions>
//                     {dimensions =>
//                       createSubscribe(
//                         Demoboard.Element({
//                           ...demoboardProps,
//                           ...clientDimensions,
//                           containerWidth: dimensions.width,

//                           // This component defines default props for these
//                           notHeadlessPattern: demoboardProps.notHeadlessPattern!,

//                           // TODO: detect when the demoboard is off screen
//                           isVisible: this.props.isVisible || isVisible,
//                         }),
//                         demoboard =>
//                           React.createElement(InnerDemoboardWidget, {
//                             onFailsafe: this.handleFailsafe,
//                             className: this.props.className,
//                             style: this.props.style,
//                             render: this.props.render,
//                             demoboard: demoboard,
//                           }),
//                       )
//                     }
//                   </Dimensions>
//                 )
//               }}
//             </ClientDimensions>
//           )}
//         </VisibilitySensor>
//       )
//     }
//   }
// }

// interface InnerDemoboardWidgetProps<Layout extends DemoboardLayout> {
//   demoboard: DemoboardModelState<Layout>
//   onFailsafe: (lastDemoboard: DemoboardModelState<Layout>) => void
//   render: (demoboard: DemoboardWidgetRendererProps<Layout>) => React.ReactNode
//   className?: string
//   style?: object
// }

// class InnerDemoboardWidget<
//   Layout extends DemoboardLayout
// > extends React.Component<InnerDemoboardWidgetProps<Layout>> {
//   render() {
//     const props = this.props

//     // Record any information that is needed to render the error screen.
//     props.onFailsafe(props.demoboard)

//     return React.createElement(
//       React.Fragment,
//       {},
//       props.render({
//         className: props.className,
//         style: props.style,
//         ...this.props.demoboard,
//       }),
//     )
//   }
// }
