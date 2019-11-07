/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

declare module 'codemirror/mode/jsx/jsx'
declare module 'codemirror/mode/css/css'
declare module 'codemirror/mode/markdown/markdown'
declare module 'codemirror/mode/htmlmixed/htmlmixed'
declare module 'codemirror/keymap/sublime'
declare module 'codemirror/addon/comment/comment' {
  const x: typeof import('codemirror/codemirror-comment')
}
declare module 'codemirror/addon/fold/xml-fold'
declare module 'codemirror/addon/scroll/simplescrollbars'

declare module 'codemirror/addon/runmode/runmode.node'
