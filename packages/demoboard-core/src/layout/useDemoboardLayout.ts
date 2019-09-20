/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardProjectState } from '../types'

export interface UseDemoboardLayoutOptions {
  /**
   * The width of the Demoboard container. Note that this may depend on the
   * styles of the demoboard itself, so you should *not* set the width
   * based on this variable.
   */
  containerWidth: number

  /**
   * The width of the browser's client area
   */
  clientWidth: number

  /**
   * The height of the browser's client area
   */
  clientHeight: number

  /**
   * Whether the left panel should open in a maximized state by default.
   * Defaults to false.
   */
  defaultLeftPanelMaximized?: boolean

  /**
   * Whether the right panel should open in a maximized state by default.
   * Defaults to false.
   */
  defaultRightPanelMaximized?: boolean

  /**
   * If specified, this will be used to set the default height of an embedded
   * demoboard, in number of lines.
   */
  defaultSizeInLines?: number

  /**
   * Indicates whether the layout should take up the full browser viewport.
   */
  fullScreen?: boolean

  /**
   * The demoboard project which this hook is laying out. The sources,
   * panel priorities, and actions will be used.
   */
  project: DemoboardProjectState
}
