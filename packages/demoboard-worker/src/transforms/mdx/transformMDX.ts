/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import rehypePrism from './rehype-prism'

import emoji from 'remark-emoji'
import images from 'remark-images'
import textr from 'remark-textr'
import slug from 'remark-slug'
import typographicBase from 'typographic-base'
import mdx from '@mdx-js/mdx'

export function transformMDX(source: string): string {
  return mdx
    .sync(source, {
      remarkPlugins: [
        slug,
        images,
        emoji,
        [textr, { plugins: [typographicBase] }],
      ],
      rehypePlugins: [rehypePrism],
    })
    .trim()
}
