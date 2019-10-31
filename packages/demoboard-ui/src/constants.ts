/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { darken, lighten, rgba } from 'polished'

export const fonts = {
  monospace: `'Inconsolata', monospace`,
}

export const colors = {
  green: '#12c8ba',
  red: '#dd3c6f',
  lightRed: '#F54391',
  blue: '#4d00e2',
  purple: '#8233ff',
  react: '#61dafb',
  lightPurple: '#b19fff',
  white: '#ffffff',
  lighterGrey: '#f0f4fc',
  lightGrey: '#dae1f2',
  grey: '#A9A9C9',
  midGrey: '#7775A6',
  darkGrey: '#8a8ab5',
  darkerGrey: '#7272a3',
  lightBlack: '#342656',
  black: '#0f0035',
}

export const codeMirrorColors = {
  dark: {
    background: colors.black,
    matchingBracket: colors.green,
    emphasisBackground: darken(0.32, colors.darkerGrey),
    matchingBackground: darken(0.37, colors.darkerGrey),
    text: darken(0.05, colors.lightGrey),
    comment: colors.darkerGrey,
    propAttr: lighten(0.3, colors.red),
    keyword: lighten(0.15, colors.red),
    string: lighten(0.3, colors.green),
    variable1: colors.lighterGrey,
    variable2: colors.lighterGrey,
    def: darken(0.05, colors.lightGrey),
    tag: lighten(0.07, colors.red),
    operator: lighten(0.15, colors.green),
    number: lighten(0.2, colors.green),
    function: colors.green,
    scrollbar: rgba(colors.white, 0.15),
  },
  light: {
    background: colors.lighterGrey,
    matchingBracket: colors.green,
    emphasisBackground: darken(0.08, colors.lighterGrey),
    matchingBackground: darken(0.04, colors.lighterGrey),
    text: colors.black,
    comment: colors.darkGrey,
    propAttr: lighten(0.15, colors.lightBlack),
    keyword: darken(0.05, colors.green),
    string: darken(0.1, colors.purple),
    variable1: darken(0.1, colors.red),
    variable2: darken(0.1, colors.green),
    def: lighten(0.15, colors.lightBlack),
    tag: darken(0.1, colors.green),
    operator: darken(0.25, colors.react),
    number: darken(0.3, colors.react),
    function: colors.green,
    scrollbar: rgba(colors.darkerGrey, 0.15),
  },
}
