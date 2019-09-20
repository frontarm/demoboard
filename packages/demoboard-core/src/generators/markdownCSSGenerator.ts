/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardGenerator } from '../types'

const Pattern = /\.mdx?$/

const markdownCSSGenerator: DemoboardGenerator = ({ pathnames }) => {
  let hasMarkdown = !!pathnames.find(pathname => Pattern.test(pathname))
  if (!hasMarkdown) {
    return null
  }

  return `@import url('https://fonts.googleapis.com/css?family=Lato:400,700|Inconsolata');

html, body, #root {
  min-height: 100%;
}

body {
  font-family: Lato, sans-serif;
  font-size: 16px;
  line-height: 1.5rem;
  margin: 0;
}

h1, h2, h3, h4, h5, h6,
p, ul, ol, img, blockquote {
  margin-left: 1.5rem;
  margin-right: 1.5rem;
}

h1 {
  margin-top: 3rem;
}
h2 {
  margin-top: 2rem;
  font-size: 1.1rem;
  color: #7272a3;
}
h3 {
  margin-top: 1rem;
}

code,
pre, pre > code {
  color: #595989;
  font-family: 'Inconsolata', monospace;
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

pre {
  padding: 1em 1rem;
  margin: .5em 1.5rem;
  overflow: auto;
}

:not(pre) > code,
pre {
  background: #f8fbfe;
}

:not(pre) > code[class*="language-"] {
  padding: .1em;
  border-radius: .3em;
  white-space: normal;
}

.token.comment,
.token.block-comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #8a8ab5;
}

.token.punctuation {
  color: #0f0035;
}

.token.tag{
  color: #0e998e;
}
.token.attr-name,
.token.namespace,
.token.deleted,
.token.function-name,
.token.boolean,
.token.number,
.token.function {
  color: #c42255;
}

.token.property,
.token.class-name,
.token.constant,
.token.symbol {
  color: #4400c9;
}

.token.selector,
.token.important,
.token.atrule,
.token.keyword,
.token.builtin {
  color: #10b1a4;
}

.token.string,
.token.char,
.token.attr-value,
.token.regex,
.token.variable {
  color: #6300ff;
}

.token.operator,
.token.entity,
.token.url {
  color: #F54391;
}

.token.important,
.token.bold {
  font-weight: bold;
}
.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}

.token.inserted {
  color: #12c8ba;
}
`
}

export default markdownCSSGenerator
