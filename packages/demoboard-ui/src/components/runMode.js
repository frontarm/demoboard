/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

let CodeMirror = {}
if (typeof navigator !== 'undefined') {
  CodeMirror = require('codemirror/lib/codemirror')
}
const RunMode = require('codemirror/addon/runmode/runmode')
const runMode = RunMode.runMode || CodeMirror.runMode

require('codemirror/mode/meta')

require('codemirror/mode/jsx/jsx')
require('codemirror/mode/css/css')
require('codemirror/mode/markdown/markdown')
require('codemirror/mode/htmlmixed/htmlmixed')

module.exports = { runMode }
