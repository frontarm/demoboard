/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { SourceMapConsumerConstructor as BaseSourceMapConsumerConstructor } from 'source-map'

interface SourceMapConsumerConstructor
  extends BaseSourceMapConsumerConstructor {
  initialize(options: { 'lib/mappings.wasm': string }): void
}

export declare const SourceMapConsumer: SourceMapConsumerConstructor
