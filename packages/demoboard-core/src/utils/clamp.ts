/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

export default clamp
