/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'

import { StyledCodeMirrorEditor } from './CodeMirrorEditor.styles'
import { useCodeMirror, UseCodeMirrorOptions } from 'use-codemirror'

export interface CodeMirrorEditorProps extends UseCodeMirrorOptions {
  className?: string
  style?: React.CSSProperties
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

  return (
    <StyledCodeMirrorEditor className={className} style={style}>
      <pre ref={codeMirror.ref} className={codeMirror.config.theme}>
        {options.value}
      </pre>
    </StyledCodeMirrorEditor>
  )
}
