/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import '@testing-library/jest-dom/extend-expect'
import { Doc } from 'codemirror'
import { renderHook, act } from '@testing-library/react-hooks'
import { useDemoboardProject } from '../src'

describe('useDemoboardProject', () => {
  test('outputs sources for build config', async () => {
    const { result } = renderHook(() =>
      useDemoboardProject({
        config: {
          initialSources: {
            '/index.js': `console.log("hello, world")`,
          },
        },
      }),
    )

    expect(Object.keys(result.current.buildConfig!.sources)).toEqual([
      '/index.html',
      '/index.js',
    ])
  })

  test('can insert and then remove emoji', async () => {
    const initialSource = `console.log("blazing  fast")`
    const doc = new Doc(initialSource, 'jsx')
    const { result } = renderHook(() =>
      useDemoboardProject({
        config: {
          initialSources: {
            '/index.js': initialSource,
          },
        },
      }),
    )

    // Insert an emoji
    await act(async () => {
      const change = {
        from: {
          line: 0,
          ch: 21,
        },
        to: {
          line: 0,
          ch: 21,
        },
        text: ['🔥'],
        removed: [''],
      }
      doc.replaceRange(change.text[0], change.from, change.to)
      result.current.dispatch({
        type: 'sources.change',
        pathname: '/index.js',
        codeMirrorDoc: doc,
        codeMirrorChanges: [change],
      })
    })

    expect(result.current.sources['/index.js']).toBe(
      `console.log("blazing 🔥 fast")`,
    )

    // Remove the same emoji
    await act(async () => {
      const change = {
        from: {
          line: 0,
          ch: 21,
        },
        to: {
          line: 0,
          ch: 23,
        },
        text: [''],
        removed: ['🔥'],
      }
      doc.replaceRange(change.text[0], change.from, change.to)
      result.current.dispatch({
        type: 'sources.change',
        pathname: '/index.js',
        codeMirrorDoc: doc,
        codeMirrorChanges: [change],
      })
    })

    expect(result.current.sources['/index.js']).toBe(
      `console.log("blazing  fast")`,
    )
  })

  test('can remove text with emoji', async () => {
    const initialSource = `💩 supports emoji`
    const doc = new Doc(initialSource, 'jsx')
    const { result } = renderHook(() =>
      useDemoboardProject({
        config: {
          initialSources: {
            '/index.js': initialSource,
          },
        },
      }),
    )

    // Remove all text
    await act(async () => {
      const change = {
        from: {
          line: 0,
          ch: 0,
        },
        to: {
          line: 0,
          ch: 17,
        },
        text: [''],
        removed: ['💩 supports emoji'],
      }
      doc.replaceRange(change.text[0], change.from, change.to)
      result.current.dispatch({
        type: 'sources.change',
        pathname: '/index.js',
        codeMirrorDoc: doc,
        codeMirrorChanges: [change],
      })
    })

    expect(result.current.sources['/index.js']).toBe(``)
  })

  test('can navigate via the url bar', async () => {
    const { result } = renderHook(() =>
      useDemoboardProject({
        config: {
          initialSources: {
            '/README.mdx': `test`,
            '/index.js': `console.log("hello")`,
          },
        },
      }),
    )

    await act(async () => {
      result.current!.dispatch({
        type: 'history.setLocationBar',
        value: '/index.js',
      })
    })

    await act(async () => {
      result.current!.dispatch({
        type: 'history.go',
      })
    })

    expect(result.current.navigation.currentLocation.pathname).toBe('/index.js')
  })

  test('can go forward, back, and refresh', async () => {
    const { result } = renderHook(() =>
      useDemoboardProject({
        config: {
          initialURL: '/README.mdx',
          initialSources: {
            '/README.mdx': `test`,
            '/index.js': `console.log("hello")`,
          },
        },
      }),
    )

    await act(async () => {
      result.current!.dispatch({
        type: 'history.setLocationBar',
        value: '/',
      })
    })

    await act(async () => {
      result.current!.dispatch({
        type: 'history.go',
      })
    })

    await act(async () => {
      result.current!.dispatch({
        type: 'history.traverse',
        count: -1,
      })
    })

    const history = result.current.state.view.history
    expect(result.current.navigation.currentLocation.pathname).toBe(
      '/README.mdx',
    )

    await act(async () => {
      result.current!.dispatch({
        type: 'history.refresh',
      })
    })

    const refreshedHistory = result.current.state.view.history
    expect(result.current.state.view.history).not.toBe(history)

    await act(async () => {
      result.current!.dispatch({
        type: 'history.refresh',
      })
    })

    expect(result.current.state.view.history).not.toBe(refreshedHistory)
    expect(result.current.navigation.currentLocation.pathname).toBe(
      '/README.mdx',
    )

    await act(async () => {
      result.current!.dispatch({
        type: 'history.traverse',
        count: 1,
      })
    })

    expect(result.current.navigation.currentLocation.pathname).toBe('/')
  })
})
