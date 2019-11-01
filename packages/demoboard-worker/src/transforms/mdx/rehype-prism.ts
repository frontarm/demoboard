/**
 * Copyright (c) 2017 Mapbox
 * MIT License
 */

import visit from 'unist-util-visit'
import nodeToString from 'hast-util-to-string'
import nodeToHTML from 'hast-util-to-html'
import refractor from 'refractor'

const aliases = {
  js: 'jsx',
  html: 'markup',
}

export default function rehypePrism(options: any) {
  options = options || {}

  return (tree: any) => {
    visit(tree, 'element', visitor)
  }

  function visitor(node: any, index: any, parent: any) {
    if (!parent || parent.tagName !== 'pre' || node.tagName !== 'code') {
      return
    }

    const lang = getLanguage(node, options.aliases || aliases)

    if (lang === null) {
      return
    }

    let result = node
    try {
      parent.properties.className = (parent.properties.className || []).concat(
        'language-' + lang,
      )
      result = refractor.highlight(nodeToString(node), lang)
    } catch (err) {
      if (/Unknown language/.test(err.message)) {
        return
      }
      throw err
    }

    node.children = []
    node.properties.dangerouslySetInnerHTML = {
      __html: nodeToHTML({
        type: 'root',
        children: result,
      }),
    }
  }
}

function getLanguage(node: any, aliases: any) {
  const className = node.properties.className || []

  for (const classListItem of className) {
    if (classListItem.slice(0, 9) === 'language-') {
      let language = classListItem.slice(9).replace(/{.*/, '')
      let alias = aliases[language]
      return alias || language
    }
  }

  return null
}
