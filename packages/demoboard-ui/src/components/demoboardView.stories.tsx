/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import {
  useDemoboardInstance,
  useDemoboardProject,
} from '@frontarm/demoboard-core'
import React from 'react'
import { action } from '@storybook/addon-actions'
import { DemoboardView, DemoboardViewGlobalStyles } from './DemoboardView'

export default {
  title: 'DemoboardView',
}

const rawExample = `
const element = document.createElement('h1')
element.innerHTML = \`
  Hello, world!<br />
\`.repeat(10)
document.getElementById('root').appendChild(element)
`

export const Loading = () => {
  const project = useDemoboardProject({
    config: {
      initialSources: {
        '/index.js': rawExample,
      },
    },
  })
  const instance = useDemoboardInstance({
    build: null,
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
    <>
      <DemoboardViewGlobalStyles />
      <DemoboardView
        project={project}
        build={null}
        instance={instance}
        layout={{
          width: '700px',
        }}
      />
    </>
  )
}
