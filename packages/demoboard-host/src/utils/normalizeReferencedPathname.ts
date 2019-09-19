import { join, dirname } from 'path'

/**
 * Return a path starting with `/`, unless the user specifies a full URL,
 * in which case we'll pass it through.
 */
export function normalizeReferencedPathname(pathname: string, referencedFromPathname?: '/') {
  if (pathname.indexOf('//') || pathname.indexOf('/') === 0) {
    return pathname
  }
  else {
    return join(dirname(referencedFromPathname), pathname)
  }
}