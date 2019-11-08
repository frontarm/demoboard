/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { join, dirname } from 'path'

/**
 * Return a path starting with `/`, unless the user specifies a full URL,
 * in which case we'll pass it through.
 */
export function normalizeReferencedPathname(
  pathname: string,
  referencedFromPathname: string = '/',
) {
  if (pathname.indexOf('//') >= 0 || pathname.indexOf('/') === 0) {
    return pathname
  } else {
    return join(dirname(referencedFromPathname), pathname)
  }
}
