/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

export interface DemoboardHistory {
  locations: DemoboardHistoryLocation[]
  index: number
  lastRenderedIndex: number
}

export interface DemoboardHistoryLocation {
  pathname: string
  search: string | null
  hash: string | null

  /**
   * State must be stringified to not confuse automerge.
   */
  stringifiedState: string | null

  /**
   * Incremented each time refresh is called
   */
  refreshCount: number

  /**
   * Indicates whether the URL doesn't need to be rendered, as it was added
   * by a call to pushState/replaceState from within the iframe.
   */
  skipRender: boolean

  /**
   * Indicates whether the URL doesn't need to be rendered, as it originated
   * from a going back from a skipRender item, or forward to a skipRender item
   */
  popState: boolean

  /**
   * A URI string that can be displayed in the address bar
   */
  uri: string
}
