/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

const emoji = require('remark-emoji')
const images = require('remark-images')
const textr = require('remark-textr')
const slug = require('remark-slug')
const typographicBase = require('typographic-base')
const mdx = require('@mdx-js/mdx')
const rehypePrism = require('./rehype-prism')

export function transformMDX(source: string): string {
  return mdx
    .sync(source, {
      mdPlugins: [slug, images, emoji, [textr, { plugins: [typographicBase] }]],
      hastPlugins: [rehypePrism],
    })
    .trim()
}
