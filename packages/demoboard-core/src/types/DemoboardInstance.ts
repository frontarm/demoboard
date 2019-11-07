/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardConsoleLine } from './DemoboardConsoleLine'
import { DemoboardHistoryLocation } from './DemoboardHistory'

export type DemoboardInstanceStatus =
  | 'initializing' // Output before the frame has emitted the `init` event
  | 'active' // The frame is loaded with the current build
  | 'updating' // The frame is loaded, but is out of date
  | 'error' // Something went wrong while loading the build within the frame
  | 'empty' // There's nothing to render (also used in case of build errors)
  | 'external' // The frame's location points to an external URL

export interface DemoboardInstance {
  // This is a map, as it allows us to overwrite previous console lines if
  // they're updated with the same id (e.g. for promise results.)
  consoleLines: Map<string, DemoboardConsoleLine>

  error?: any

  location: DemoboardHistoryLocation

  ref: (node: HTMLIFrameElement) => void

  status: DemoboardInstanceStatus
}
