/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

export interface DemoboardGeneratorOptions {
  context: any
  dependencies: {
    [packageName: string]: string
  }
  metadata: any
  pathname: string
  pathnames: string[]
  props: any
}

/**
 * Return a string, or `null` in case the source should not be generated.
 */
export type DemoboardGenerator = (
  options: DemoboardGeneratorOptions,
) => string | null
