/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import { DemoboardInstance } from '../types'

export interface DemoboardInstanceIFrameProps
  extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  instance: DemoboardInstance
}

export function DemoboardInstanceIFrame({
  children,
  instance,
  ...rest
}: DemoboardInstanceIFrameProps) {
  let status = instance.status
  if (status === 'error' || status === 'empty') {
    return <div {...rest} />
  } else if (status === 'external') {
    return <iframe {...rest} src={instance.location.uri} title="Demoboard" />
  } else {
    return (
      <StaticIFrame
        forwardRef={instance.ref}
        props={{
          ...rest,
          allowFullScreen: true,
          sandbox:
            'allow-modals allow-scripts allow-popups allow-forms allow-same-origin',
          // This will be set via ref
          src: '',
        }}
      />
    )
  }
}

interface StaticIFrameProps {
  props: React.IframeHTMLAttributes<HTMLIFrameElement>
  forwardRef: React.Ref<HTMLIFrameElement>
}

/**
 * Re-rendering an iframe can cause it to refresh even if the source hasn't,
 * so we want manual control over re-renders.
 */
class StaticIFrame extends React.Component<StaticIFrameProps> {
  shouldComponentUpdate(nextProps: StaticIFrameProps) {
    return nextProps.forwardRef !== this.props.forwardRef
  }

  render() {
    return (
      <iframe
        {...this.props.props}
        ref={this.props.forwardRef}
        title="Demoboard"
      />
    )
  }
}
