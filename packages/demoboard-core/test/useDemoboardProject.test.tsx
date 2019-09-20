/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { useDemoboardProject } from '../src'

function Test() {
  let project = useDemoboardProject({
    config: {
      initialSources: {
        '/index.js': `console.log("hello, world")`,
      },
    },
  })

  return <div>{Object.keys(project.buildConfig!.sources).join(',')}</div>
}

describe('useDemoboardProject', () => {
  test('outputs sources for build config', async () => {
    let component = ReactTestRenderer.create(<Test />)

    expect(component.toJSON()).toEqual('/index.js,/index.html')
  })
})
