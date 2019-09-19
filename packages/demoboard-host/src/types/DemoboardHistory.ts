export interface DemoboardHistory {
  locations: DemoboardHistoryLocation[]
  index: number
  lastRenderedIndex: number
}

export interface DemoboardHistoryLocation {
  pathname: string
  search?: string
  hash?: string
  state?: any

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
