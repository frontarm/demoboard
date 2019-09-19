import * as React from 'react'
import { DemoboardInstance } from '../types'

const containerURL = process.env.REACT_APP_DEMOBOARD_CONTAINER

export interface DemoboardInstanceIFrameProps {
  instance: DemoboardInstance
  className?: string
  style?: object
}

export default function DemoboardInstanceIFrame({
  instance,
  ...rest
}: DemoboardInstanceIFrameProps) {
  let status = instance.status
  if (status === 'error' || status === 'empty') {
    return <div {...rest} />
  } else if (status === 'external') {
    return <iframe {...rest} src={instance.location.uri} />
  } else {
    return (
      <StaticIFrame
        forwardRef={instance.ref}
        props={{
          ...rest,
          allowFullScreen: true,
          sandbox:
            'allow-modals allow-scripts allow-popups allow-forms allow-same-origin',
          src: containerURL + '#' + instance.id,
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
    return <iframe {...this.props.props} ref={this.props.forwardRef} />
  }
}
