/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

// import * as React from 'react'
// import * as ReactDOM from 'react-dom'
// import ExecutionEnvironment from 'exenv'

// let injectorResizeObserver
// if (ExecutionEnvironment.canUseDOM) {
//   const ResizeObserver = require('resize-observer-polyfill').default

//   class InjectorResizeObserver {
//     callbacks: Map<Element, Function>
//     observer: any

//     constructor() {
//       this.callbacks = new Map()
//       this.observer = new ResizeObserver(entries => {
//         for (const entry of entries) {
//           const callback = this.callbacks.get(entry.target)

//           if (callback) {
//             callback({
//               height: entry.contentRect.height,
//               width: entry.contentRect.width,
//             })
//           }
//         }
//       })
//     }

//     observe(target, callback) {
//       this.observer.observe(target)
//       this.callbacks.set(target, callback)
//     }

//     unobserve(target, callback) {
//       this.observer.unobserve(target)
//       this.callbacks.delete(target)
//     }
//   }

//   injectorResizeObserver = new InjectorResizeObserver()
// }

// export interface DimensionsProps {
//   /**
//    * The value to use for `height` before we are able to make a measurement.
//    */
//   defaultHeight?: number

//   /**
//    * The value to use for `width` before we are able to make a measurement.
//    */
//   defaultWidth?: number

//   /**
//    * If a number or `null`, the height will be passed directly to the child
//    * element instead of being observed.
//    */
//   height?: number | null

//   /**
//    * If a number or `null`, the width will be passed directly to the child
//    * element instead of being observed.
//    */
//   width?: number | null

//   /**
//    * This component expects a single child that is a React Element.
//    */
//   children: (props: { width; height }) => React.ReactElement<any>
// }

// export interface DimensionsState {
//   observed?: Element
//   height: number
//   width: number
// }

// /**
//  * Inject the child element's width and height, as computed by a
//  * ResizeObserver.
//  */
// export class Dimensions extends React.Component<
//   DimensionsProps,
//   DimensionsState
// > {
//   domNode: Element

//   constructor(props) {
//     super(props)

//     // The dimensions are not defined until we can measure them, or unless
//     // a fixed value is provided.
//     this.state = {
//       observed: undefined,
//       height: undefined,
//       width: undefined,
//     }
//   }

//   componentDidMount() {
//     const shouldObserve =
//       this.props.width === undefined || this.props.height === undefined

//     if (shouldObserve) {
//       this.observe()
//     }
//   }

//   componentWillReceiveProps(nextProps) {
//     const shouldObserve =
//       nextProps.width === undefined || nextProps.height === undefined

//     if (shouldObserve && !this.state.observed) {
//       this.observe()
//     } else if (!shouldObserve && this.state.observed) {
//       this.unobserve()
//       this.setState({
//         observed: undefined,
//       })
//     }
//   }
//   componentDidUpdate(prevProps, prevState) {
//     const shouldObserve =
//       this.props.width === undefined || this.props.height === undefined

//     if (this.domNode !== this.state.observed) {
//       this.unobserve()
//       if (this.domNode && shouldObserve) {
//         this.observe()
//       }
//     }
//   }
//   componentWillUnmount() {
//     this.unobserve()
//   }

//   shouldComponentUpdate(nextProps, nextState) {
//     const measuredHeightChanged = nextState.height !== this.state.height
//     const measuredWidthChanged = nextState.width !== this.state.width

//     // don't cause an update when it originated from a resize observation,
//     // but that observation is overriden by a forced width/height
//     const insignificantMeasurementOccured =
//       nextState.observed &&
//       this.state.observed &&
//       (measuredHeightChanged || measuredWidthChanged) &&
//       !(
//         (measuredHeightChanged && nextProps.height === undefined) ||
//         (measuredWidthChanged && nextProps.width === undefined)
//       )

//     return !insignificantMeasurementOccured
//   }

//   render() {
//     const props = this.props
//     const state = this.state

//     return React.cloneElement(
//       React.Children.only(
//         props.children({
//           width: state.width === undefined ? props.defaultWidth : state.width,
//           height:
//             state.height === undefined ? props.defaultHeight : state.height,
//         }),
//       ),
//       { ref: this.receiveRef },
//     )
//   }

//   receiveRef = x => {
//     this.domNode = x && (ReactDOM.findDOMNode(x) as Element)
//   }

//   handleResize = measured => {
//     this.setState({
//       height: measured.height,
//       width: measured.width,
//     })
//   }

//   observe() {
//     injectorResizeObserver.observe(this.domNode, this.handleResize)
//     const measured = this.domNode.getBoundingClientRect()
//     this.setState({
//       observed: this.domNode,
//       height: measured.height,
//       width: measured.width,
//     })
//   }

//   unobserve() {
//     if (this.state.observed) {
//       injectorResizeObserver.unobserve(this.state.observed, this.handleResize)
//     }
//   }
// }
