/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'

import { StyledCodeMirrorEditor } from './CodeMirrorEditor.styles'
import { useCodeMirror, UseCodeMirrorOptions } from 'use-codemirror'

import { runMode } from './runMode'

export interface CodeMirrorEditorProps extends UseCodeMirrorOptions {
  className?: string
  style?: React.CSSProperties
}

function esc(str: string) {
  return str.replace(/[<&]/g, function(ch) {
    return ch === '&' ? '&amp;' : '&lt;'
  })
}

function highlight(code: string, lang: string): string {
  let curStyle: string | null = null
  let accum = ''
  let parts: string[] = ['<pre class="CodeMirror-line">']
  const flush = () => {
    if (curStyle) {
      parts.push(
        '<span class="' +
          curStyle.replace(/(^|\s+)/g, '$1cm-') +
          '">' +
          esc(accum) +
          '</span>',
      )
    } else {
      parts.push(esc(accum))
    }
  }

  runMode(code, lang, (text: string, style: string) => {
    if (style !== curStyle) {
      flush()
      curStyle = style
      accum = text
    } else {
      accum += text
    }
  })
  flush()
  return (
    parts
      .join('')
      .split('\n')
      .join('<span>&#8203;</span></pre><pre class="CodeMirror-line">') +
    '</pre>'
  )
}

const modeAliases: { [name: string]: string } = {
  js: 'jsx',
  html: 'htmlmixed',
  md: 'markdown',
  mdx: 'markdown',
  scss: 'text/x-scss',
}

function getDefaultMode(docName?: string) {
  return docName && docName.split('.').reverse()[0]
}

export function CodeMirrorEditor({
  className,
  style,
  ...options
}: CodeMirrorEditorProps) {
  let codeMirror = useCodeMirror({
    ...options,
    config: {
      theme: 'demoboard-light',
      ...options.config,
    },
  })

  let mode =
    (options.config && options.config.mode) || getDefaultMode(options.docName)

  mode = modeAliases[mode] || mode

  const highlightedSource = highlight(options.value, mode)

  return (
    <StyledCodeMirrorEditor className={className} style={style}>
      <div className={`CodeMirror cm-s-demoboard-light`} ref={codeMirror.ref}>
        <div className="CodeMirror-scroll" tabIndex={-1}>
          <div
            className="CodeMirror-sizer"
            style={{
              marginLeft: '34px',
              paddingBottom: '8px',
              paddingRight: '8px',
            }}>
            <div className="CodeMirror-lines" role="presentation">
              <div
                role="presentation"
                style={{ position: 'relative', outline: 'none' }}>
                <div
                  className="CodeMirror-code"
                  dangerouslySetInnerHTML={{
                    __html: highlightedSource,
                  }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledCodeMirrorEditor>
  )
}
