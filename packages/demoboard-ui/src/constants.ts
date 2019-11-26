/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { darken, lighten, rgba } from 'polished'
import { css } from 'styled-components'

export const beaconRing = (selector: string, radius = '3px') =>
  css`
    ${selector} {
      content: ' ';
      position: absolute;
      border-radius: ${radius};
      left: 0px;
      right: 0px;
      top: 0px;
      bottom: 0px;
      z-index: -1;
    }
    :focus${selector} {
      box-shadow: ${shadows.beacon()};
    }
  `

export const colors = {
  beacon: {
    focus: 'rgba(68, 136, 221, 0.5)',
  },

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

export const dimensions = {
  topNavHeight: '40px',
  headerHeight: '40px',
  footerHeight: '28px',

  // TODO: compute heights of header controls based on this and headerHeight
  headerControlGutter: '4px',

  raisedButtonHeight: '32px',
}

export const easings = {
  easeInOut: 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
  easeIn: 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
  easeOut: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
}

export const fonts = {
  monospace: `'Inconsolata', monospace`,
  sansSerif: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif`,
}

export const radii = {
  small: '3px',
  medium: '6px',
}

export const shadows = {
  beacon: () => `
    0 0 0 2px ${colors.beacon.focus}
  `,
  bevel: () => `
    1px 1px 1px rgba(255, 255, 255, 0.08) inset,
    -1px -1px 1px rgba(0, 0, 0, 0.08) inset
  `,
  bevelReverse: () => `
    -1px -1px 1px rgba(255, 255, 255, 0.06) inset,
    1px 1px 1px rgba(0, 0, 0, 0.06) inset
  `,
  card: () => `
    0 0 5px 3px rgba(0, 0, 0, 0.01),
    0 0 2px 0px rgba(0, 0, 0, 0.02)
  `,
  drop: () => `
    1px 1px 3px rgba(0, 0, 0, 0.02)
  `,
  sunk: () => `
    2px 2px 1px ${rgba(colors.lightGrey, 0.1)} inset
  `,
}
