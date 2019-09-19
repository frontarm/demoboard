import emoji from 'remark-emoji'
import images from 'remark-images'
import textr from 'remark-textr'
import slug from 'remark-slug'
import typographicBase from 'typographic-base'
import mdx from '@mdx-js/mdx'
import rehypePrism from './rehype-prism'

export function transformMDX(code) {
  return mdx.sync(code, {
    mdPlugins: [
      slug,
      images, 
      emoji,
      [textr, { plugins: [typographicBase] }]
    ],
    hastPlugins: [
      rehypePrism,
    ],
  }).trim()
}