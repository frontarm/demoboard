/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardPanelType } from './DemoboardPanelType'

export type DemoboardLayoutMode = 'mobile' | 'single' | 'double'
export type DemoboardLayoutSide = 'left' | 'right'

export interface DemoboardLayout<
  PanelType extends DemoboardPanelType = DemoboardPanelType
> {
  actions: DemoboardLayoutActions

  // Initially based on the number of lines. Can also be passed in via props,
  // and resized by the user.
  height?: number

  // Initially set to 0.5. Can also be passed in vai props and resized by the
  // user.
  editorProportion: number
  leftPanelProportion: number
  rightPanelProportion: number
  sidebarWidth: number

  // Based on layout state and props
  fullScreen: boolean

  // In mobile and single modes, only one of the sides can be displayed at a
  // time. This will be `null` when the mode is double or triple.
  side: DemoboardLayoutSide | null

  // Based on the available width.
  mode: DemoboardLayoutMode

  // Based on panel the project's panelPriorityOrder, along with the width
  // and height of the screen.
  sidebarPanel: PanelType | null
  leftPanel: PanelType | null
  rightPanel: PanelType | null

  // Based on layout state, the height of the screen, and whether the panel
  // that would normally appear above the panels has any priority.
  leftPanelMaximized: boolean
  rightPanelMaximized: boolean
}

export type DemoboardLayoutActions = {
  changeDimensions: (options: { width: number; height: number }) => void

  setSidebarWidth: (proportion: number) => void
  setEditorProportion: (proportion: number) => void
  setLeftPanelProportion: (proportion: number) => void
  setRightPanelProportion: (proportion: number) => void

  toggleFullScreen: () => void
  toggleLeftPanelMaximized: () => void
  toggleRightPanelMaximized: () => void

  showLeftSide: () => void
  showRightSide: () => void
}
