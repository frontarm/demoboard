/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import ExecutionEnvironment from 'exenv'
import * as React from 'react'

// export interface ClientDimensionsProps {
//   children: (props: ClientDimensionsState) => React.ReactNode
//   defaultWidth?: number
//   defaultHeight?: number
// }

// export interface ClientDimensionsState {
//   width: number
//   height: number
// }

// export class ClientDimensions extends React.Component<
//   ClientDimensionsProps,
//   ClientDimensionsState
// > {
//   static defaultProps = {
//     defaultWidth: 1000,
//     defaultHeight: 700,
//   }

//   constructor(props) {
//     super(props)

//     this.state = ExecutionEnvironment.canUseDOM
//       ? {
//           width: document.body.clientWidth,
//           height: document.body.clientHeight,
//         }
//       : { width: props.defaultWidth, height: props.defaultHeight }
//   }

//   componentDidMount() {
//     if (ExecutionEnvironment.canUseDOM) {
//       window.addEventListener('resize', this.handleResize, true)
//     }
//   }

//   componentWillUnmount() {
//     window.removeEventListener('resize', this.handleResize, true)
//   }

//   handleResize = () => {
//     this.setState({
//       width: document.body.clientWidth,
//       height: document.body.clientHeight,
//     })
//   }

//   render() {
//     return this.props.children(this.state)
//   }
// }
