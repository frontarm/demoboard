/**
 * Includes work from multiple sources:
 *
 * - Copyright 2016 Jed Watson
 *   https://github.com/JedWatson/react-codemirror/blob/master/src/Codemirror.js
 *   MIT Licensed
 *
 * - Copyright 2013 - 2018 Formidable Labs
 *   https://github.com/FormidableLabs/component-playground/blob/master/src/components/editor.jsx
 *   MIT Licensed
 *
 * - Copyright 2019 - present Seven Stripes Kabushiki Kaisha
 *   Apache 2.0 License
 */

import {
  Doc,
  Editor,
  EditorChange,
  EditorConfiguration,
  Pass,
} from 'codemirror'
import ExecutionEnvironment from 'exenv'
import React from 'react'

import { StyledCodeMirrorError } from './CodeMirrorEditor.styles'

let codeMirror: any
if (ExecutionEnvironment.canUseDOM) {
  codeMirror = require('codemirror')

  require('codemirror/mode/jsx/jsx')
  require('codemirror/mode/css/css')
  require('codemirror/mode/markdown/markdown')
  require('codemirror/mode/htmlmixed/htmlmixed')
  require('codemirror/keymap/sublime')
  require('codemirror/addon/comment/comment')
  require('codemirror/addon/edit/closebrackets')
  require('codemirror/addon/fold/xml-fold')
  require('codemirror/addon/scroll/simplescrollbars')
  require('codemirror/addon/selection/active-line')
}

interface ExtendedKeyMap {
  [keyName: string]:
    | false
    | string
    | ((instance: ExtendedEditor) => void | typeof Pass)
}

// Plugins allow for some extra configuration
interface ExtendedEditorConfiguration
  extends Omit<EditorConfiguration, 'extraKeys'> {
  autoCloseBrackets?: boolean
  matchBrackets?: boolean
  matchTags?: {
    bothTags: boolean
  }
  styleActiveLine?: boolean
  extraKeys?: string | ExtendedKeyMap
}

interface ExtendedEditor extends Editor {
  replaceSelection(options: any): any
  listSelections(): any
  toggleComment(options: any): any
}

const modeAliases: { [name: string]: CodeMirrorMode } = {
  js: 'jsx',
  html: 'htmlmixed',
  md: 'markdown',
  scss: 'text/x-scss',
}

const OptionProps = [
  'readOnly' as const,
  'lineNumbers' as const,
  'lineWrapping' as const,
  'mode' as const,
  'theme' as const,
  'scrollbarStyle' as const,
]

function normalizeLineEndings(str: string) {
  if (!str) return str
  return str.replace(/\r\n|\r/g, '\n')
}

export type CodeMirrorMode =
  | 'js'
  | 'jsx'
  | 'css'
  | 'htmlmixed'
  | 'markdown'
  | 'text/x-scss'

export interface CodeMirrorProps {
  theme: string
  readOnly?: boolean
  fitToContent?: boolean
  value: string
  doc?: Doc
  onChange: (value: string, changes: EditorChange[], doc: Doc) => void
  selectedLines?: number[]
  mode: string
  lineNumbers?: boolean
  lineWrapping?: boolean
  preserveScrollPosition?: boolean
  scrollbarStyle?: 'simple' | 'native'
  onScroll?: (scrollInfo: any) => void
  style?: React.CSSProperties
  className?: string
}

export class CodeMirrorEditor extends React.Component<CodeMirrorProps> {
  static defaultProps = {
    theme: 'demoboard-light',
    fitToContent: false,
    scrollbarStyle: 'simple',
  }

  defaultDoc?: Doc
  cm?: Editor
  preNode?: HTMLPreElement

  getDoc(props: CodeMirrorProps, mode: CodeMirrorMode) {
    if (props.doc) {
      delete this.defaultDoc
      return props.doc
    } else if (!this.defaultDoc) {
      this.defaultDoc = new codeMirror.Doc(props.value || '', mode)
    }
    return this.defaultDoc
  }

  getMode(): CodeMirrorMode {
    let mode = this.props.mode
    if (modeAliases[mode]) {
      mode = modeAliases[mode]
    }
    return mode as CodeMirrorMode
  }

  componentDidMount() {
    const options: ExtendedEditorConfiguration = {
      matchBrackets: true,
      smartIndent: false,
      tabSize: 2,
      indentWithTabs: false,
      autoCloseBrackets: true,
      keyMap: 'sublime',
      matchTags: { bothTags: true },
      styleActiveLine: true,
      scrollbarStyle: this.props.scrollbarStyle,
      extraKeys: {
        Tab: function(cm) {
          var spaces = Array(cm.getOption('indentUnit')! + 1).join(' ')
          cm.replaceSelection(spaces)
        },
        'Cmd-/': cm => {
          cm.listSelections().forEach(() => {
            cm.toggleComment({ indent: true })
          })
        },
      },
      value: this.preNode!.innerHTML,
    }

    for (let key of OptionProps) {
      options[key] = this.props[key]
    }

    if (options.mode && modeAliases[options.mode]) {
      options.mode = modeAliases[options.mode]
    }

    if (this.props.fitToContent) {
      options.viewportMargin = Infinity
    }

    const cm = new codeMirror(
      (element: Node) =>
        this.preNode!.parentNode!.replaceChild(element, this.preNode!),
      options,
    )
    cm.on('changes', this.handleChanges)
    cm.on('scroll', this.handleScroll)
    cm.swapDoc(this.getDoc(this.props, options.mode))

    this.cm = cm

    if (this.props.selectedLines) {
      this.highlightSelectedLines()
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: CodeMirrorProps) {
    const mode = this.getMode()
    const prevDoc = this.cm!.getDoc()
    const nextDoc = this.getDoc(nextProps, mode)
    if (prevDoc !== nextDoc) {
      this.cm!.swapDoc(nextDoc!)
    } else if (
      this.cm &&
      nextProps.value !== undefined &&
      normalizeLineEndings(this.cm!.getValue()) !==
        normalizeLineEndings(nextProps.value)
    ) {
      if (this.props.preserveScrollPosition) {
        var prevScrollPosition = this.cm.getScrollInfo()
        this.cm.setValue(nextProps.value)
        this.cm.scrollTo(prevScrollPosition.left, prevScrollPosition.top)
      } else {
        this.cm.setValue(nextProps.value)
      }
    }

    for (let key of OptionProps) {
      let prop = nextProps[key]

      if (prop !== this.props[key]) {
        if (key === 'mode' && modeAliases[prop as any]) {
          prop = modeAliases[prop as any]
        }

        this.cm!.setOption(key, prop)
      }
    }
  }

  componentWillUnmount() {
    // is there a lighter-weight way to remove the cm instance?
    if (this.cm) {
      // Need to swap out the old doc, otherwise it can't be used again on future codemirror instances.
      this.cm.swapDoc(new codeMirror.Doc(''))
    }
  }

  highlightSelectedLines = () => {
    if (Array.isArray(this.props.selectedLines)) {
      this.props.selectedLines.forEach(lineNumber =>
        this.cm!.addLineClass(
          lineNumber,
          'wrap',
          'CodeMirror-activeline-background',
        ),
      )
    }
  }

  focus() {
    if (this.cm) {
      this.cm.focus()
    }
  }

  render() {
    return (
      <StyledCodeMirrorError fitToContent={this.props.fitToContent}>
        <pre ref={this.receivePreNode} className={this.props.theme}>
          {this.props.value}
        </pre>
      </StyledCodeMirrorError>
    )
  }

  receivePreNode = (ref: HTMLPreElement) => (this.preNode = ref)

  handleChanges = (editor: Editor, changes: EditorChange[]) => {
    // Ignore changes caused by this component
    if (changes.length === 1 && changes[0].origin === 'setValue') {
      return
    }

    if (!this.props.readOnly && this.props.onChange) {
      this.props.onChange(editor.getValue(), changes, editor.getDoc())
    }
  }

  handleScroll = (codeMirror: ExtendedEditor) => {
    this.props.onScroll && this.props.onScroll(codeMirror.getScrollInfo())
  }
}
