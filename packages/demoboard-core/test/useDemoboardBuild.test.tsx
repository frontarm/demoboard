/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import * as React from 'react'
import TestRenderer from 'react-test-renderer'
import { useDemoboardBuild } from '../src'

const act = TestRenderer.act

describe('useDemoboardBuild', () => {
  test('initially outputs null, and outputs success once complete', async () => {
    function Test() {
      let project = useDemoboardBuild({
        entryPathname: '/index.js',
        sources: {
          '/index.js': `console.log("hello, world")`,
        },
      })

      return <>{project && project.status}</>
    }

    let component: any
    await act(async () => {
      component = TestRenderer.create(<Test />)
      expect(component.toJSON()).toEqual(null)
    })
    expect(component.toJSON()).toEqual('success')
  })

  test('transforms mdx files', async () => {
    let project: any

    function Test() {
      project = useDemoboardBuild({
        entryPathname: '/README.mdx',
        sources: {
          '/README.mdx': `# Hello world\n\nI'm a markdown file`,
        },
      })

      return <>{project && project.status}</>
    }

    let component: any
    await act(async () => {
      component = TestRenderer.create(<Test />)
    })

    console.log(project)

    expect(component.toJSON()).toEqual('success')

    let transformedSource =
      project &&
      project.transformedModules &&
      project.transformedModules['/README.mdx'].transformedSource

    expect(transformedSource).toMatch(`"Hello world"`)
    expect(transformedSource).toMatch(`function MDXContent`)
  })
})
