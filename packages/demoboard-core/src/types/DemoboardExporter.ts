/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardProjectState } from './DemoboardProject'
import { DemoboardBuild } from './DemoboardBuild'

export type DemoboardExporter = (options: {
  build: DemoboardBuild
  project: DemoboardProjectState
}) => Promise<Blob>
