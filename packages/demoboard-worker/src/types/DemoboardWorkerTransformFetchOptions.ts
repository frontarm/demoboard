/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

export interface DemoboardWorkerTransformFetchOptions extends RequestInit {
  baseURL?: string

  // If provided, instead of creating a URL by appending a filename to the
  // base URL, this will be used as is.
  overrideURLs?: { [name: string]: string }
}
