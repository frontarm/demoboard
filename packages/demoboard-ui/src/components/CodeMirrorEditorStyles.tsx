/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import codeMirrorCSS from 'codemirror/lib/codemirror.css'
import dialogCSS from 'codemirror/addon/dialog/dialog.css'
import simpleScrollbarsCSS from 'codemirror/addon/scroll/simplescrollbars.css'
import { rgba } from 'polished'
import styled, { createGlobalStyle, css } from 'styled-components'

import { colors, codeMirrorColors, fonts } from '../constants'

export const CodeMirrorEditorGlobalStyles = createGlobalStyle`
  ${codeMirrorCSS};
  ${dialogCSS};
  ${simpleScrollbarsCSS}
`

export const StyledCodeMirrorEditor = styled.div`
  width: 100% !important;
  height: 100% !important;
  max-height: 100%;

  > textarea {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;

    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    font-size: 14px;
    line-height: 1.3;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }

  &.fit-to-content :global .CodeMirror {
  }

  & .CodeMirror {
    height: 100% !important;
    font-size: 14px;

    pre {
      font-family: ${fonts.monospace};
      font-size: 14px;
      line-height: 1.3;
    }
  }
  .CodeMirror-linenumber {
    line-height: normal;
  }
  .CodeMirror-scrollbar-filler {
    background: ${rgba(colors.white, 0.3)};
  }

  ${codeMirrorTheme('demoboard-dark', codeMirrorColors.dark)}
  ${codeMirrorTheme('demoboard-light', codeMirrorColors.light)}
`

interface CodeMirrorThemeColors {
  background: string
  emphasisBackground: string
  matchingBackground: string
  matchingBracket: string
  text: string
  comment: string
  propAttr: string
  keyword: string
  string: string
  variable1: string
  variable2: string
  def: string
  tag: string
  operator: string
  number: string
  function: string
  scrollbar: string
}

function codeMirrorTheme(name: string, themeColors: CodeMirrorThemeColors) {
  return css`
    .cm-s-${name} {
      &.CodeMirror {
        background: ${themeColors.background};
        color: ${themeColors.text} !important;

        .CodeMirror-selected {
          background: ${themeColors.emphasisBackground};
        }
        .CodeMirror-line::selection,
        .CodeMirror-line > span::selection,
        .CodeMirror-line > span > span::selection {
          background: rgba(73, 72, 62, 0.99);
        }
        .CodeMirror-line::-moz-selection,
        .CodeMirror-line > span::-moz-selection,
        .CodeMirror-line > span > span::-moz-selection {
          background: rgba(73, 72, 62, 0.99);
        }

        .CodeMirror-gutters {
          background: ${themeColors.background};
          padding-right: 0.25rem;
          border-right: 1px solid ${rgba('white', 0.15)};
        }
      }
      /*
      .CodeMirror-guttermarker { color: white; }
      .CodeMirror-guttermarker-subtle { color: #d0d0d0; }
      */
      .CodeMirror-linenumber {
        color: ${themeColors.comment};
      }
      .CodeMirror-cursor {
        border-left: 1px solid ${themeColors.text};
      }

      span.cm-comment {
        color: ${themeColors.comment};
      }
      span.cm-atom {
        color: ${themeColors.text};
      }
      span.cm-number {
        color: ${themeColors.number};
      }

      span.cm-property,
      span.cm-attribute {
        color: ${themeColors.propAttr};
      }
      span.cm-keyword {
        color: ${themeColors.keyword};
      }
      span.cm-builtin {
        color: ${themeColors.keyword};
      }
      span.cm-string {
        color: ${themeColors.string};
      }
      span.cm-string-2 {
        color: ${themeColors.string};
      }

      span.cm-variable {
        color: ${themeColors.variable1};
      }
      span.cm-variable-2 {
        color: ${themeColors.variable2};
      }
      span.cm-variable-3 {
        color: ${themeColors.variable2};
      }
      span.cm-def {
        color: ${themeColors.def};
      }
      span.cm-bracket {
        color: ${themeColors.operator};
      }
      span.cm-operator {
        color: ${themeColors.operator};
      }
      span.cm-number {
        color: ${themeColors.number};
      }
      span.cm-tag {
        color: ${themeColors.tag};
      }
      span.cm-header {
        color: ${colors.darkGrey};
      }
      span.cm-link {
        color: ${colors.darkGrey};
      }
      span.cm-error {
        color: ${colors.red};
      }

      .CodeMirror-matchingtag {
        background: ${themeColors.matchingBackground};
      }
      .CodeMirror-activeline-background {
        background: ${rgba(themeColors.emphasisBackground, 0.5)};
      }
      .CodeMirror-matchingbracket {
        /* color: ${colors.black}; */
        color: inherit;
        display: inline-box;
        margin: -1px;
        border: 1px solid fade(${themeColors.comment}, 30%);
      }

      /* Scrollbar styles */
      .CodeMirror-simplescroll-horizontal,
      .CodeMirror-simplescroll-vertical {
        background: ${themeColors.scrollbar};
        z-index: 2;
        div {
          background: ${themeColors.scrollbar};
          border-radius: 0;
          border: none;
        }
      }
    }
  `
}
