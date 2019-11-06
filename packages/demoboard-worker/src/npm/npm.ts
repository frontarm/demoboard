/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { join } from 'path'
import { valid, validRange, satisfies } from 'semver'
import nodeBrowserModules from './nodeBrowserModules'
import {
  NPMPackage,
  NPMResolution,
  NPMFile,
  NPMFiles,
  NPMDirectory,
} from './npmTypes'

function getEntryPointFromPackage(pkg: NPMPackage) {
  let entry = pkg.unpkg || pkg.main
  if (typeof pkg.browser === 'string') {
    entry = pkg.browser
  }
  return entry
}

// assumes we have an npm url (without the prototocl), then:
// - checks to find the actual url for the desired resource
// - pre-fetches the package.json
export async function resolve(
  name: string,
  version: string,
  pathname = '',
): Promise<NPMResolution | null> {
  let browserName = nodeBrowserModules[name]
  if (browserName === null) {
    return null
  }
  if (!browserName) {
    browserName = name
  }

  // Ignore macros. They can't easily be implemented within the browser, but
  // we'll pretend they exist so that things like styled-components/macro can be
  // copy-pasted.
  pathname = pathname.replace(/\/macro$/, '')

  let pkg = await getPackage(browserName, version)

  version = '@' + pkg.version

  // For some reason, some people put slashes after packages :-/
  if (pathname === '/') {
    pathname = ''
  }

  // TODO: find a better way to solve this special case
  if (browserName === 'readable-stream' && /^\/\w+\.js$/.test(pathname)) {
    pathname = '/lib/_stream_' + pathname.slice(1)
  }

  if (pathname === '') {
    let entry = getEntryPointFromPackage(pkg)
    if (entry) {
      pathname = join('/', entry)
    }
  }

  let resolvedPathname = await resolvePathWithinPackage(pathname, pkg)

  if (resolvedPathname === null) {
    return {
      status: 'notfound',
      url: 'https://unpkg.com/' + name + version + pathname,
    }
  }

  // The `browser` field can contain an object of individual paths that should
  // be mapped to different files within the browser
  let browser =
    pkg.browser && typeof pkg.browser === 'object'
      ? normalizePathsObject(pkg.browser)
      : {}
  if (browser[resolvedPathname]) {
    resolvedPathname = browser[resolvedPathname]
  }

  return {
    status: 'resolved',
    browserName,
    name,
    version,
    pathname: resolvedPathname,
    url: 'https://unpkg.com/' + name + version + resolvedPathname,
  }
}

async function resolvePathWithinPackage(
  pathname: string,
  pkg: NPMPackage,
  level = 0,
): Promise<string | null> {
  let node: NPMFile | NPMDirectory | undefined = pkg.meta
  let lastNode: NPMDirectory | null = null
  let pathSegments = pathname.split('/').filter(isNotBlankString)
  let segment: string | undefined
  for (let i = 0; i < pathSegments.length; i++) {
    segment = pathSegments[i]
    if (!node || node.type === 'file') {
      return null
    }
    lastNode = node
    node = node.files.get(segment)
  }

  if (node && node.type === 'directory') {
    let directoryNode = node
    node = node.files.get('index.js')
    if (node) {
      pathname = join(pathname, '/index.js')
    } else {
      node = directoryNode.files.get('package.json')
      if (node && level === 0) {
        let nestedPackageResponse = await fetch(
          'https://unpkg.com/' +
            pkg.name +
            '@' +
            pkg.version +
            pathname +
            '/package.json',
        )
        if (!nestedPackageResponse.ok) {
          throw nestedPackageResponse
        }
        let nestedPackage = await nestedPackageResponse.json()
        let nestedEntry = getEntryPointFromPackage(nestedPackage)
        if (nestedEntry) {
          return resolvePathWithinPackage(
            join(pathname, nestedEntry),
            pkg,
            level + 1,
          )
        }
      }
    }
  }

  if (!node && lastNode && segment) {
    node = lastNode.files.get(segment + '.js')
    if (node) {
      pathname += '.js'
    }
  }

  if (node) {
    return pathname
  }
  return null
}

// TODO: turn this into an LRU cache
const npmPackages = {} as {
  [key: string]: Promise<NPMPackage> | NPMPackage
}

// Keep track of version aliases of each package, so that if an alias is
// referenced in multiple places, it can be immediately resolved to the
// appropriate actual version.
const npmVersionAliases = {} as {
  [name: string]: string
}

// For each package, store a list of versions that we have any ids for.
const npmRequestedPackageVersions = {} as {
  [name: string]: string[]
}

export async function getPackage(
  name: string,
  requestedVersion = '',
): Promise<NPMPackage> {
  // Try and resolve to a more specific version before fetching, to avoid
  // needless fetches
  if (requestedVersion) {
    if (npmVersionAliases[name + requestedVersion]) {
      requestedVersion = npmVersionAliases[name + requestedVersion]
    } else if (!valid(requestedVersion.slice(1))) {
      requestedVersion =
        getKnownMatchingVersion(name, requestedVersion) || requestedVersion
    }
  }

  let key = name + requestedVersion
  let existingPackage = npmPackages[key]
  if (existingPackage) {
    return existingPackage
  }

  let pkgPromise = fetchPackage(key)
  npmPackages[key] = pkgPromise
  let pkg = await pkgPromise
  let version = '@' + pkg.version
  if (version !== requestedVersion) {
    npmVersionAliases[name + requestedVersion] = version
  }

  let packageVersions = npmRequestedPackageVersions[name]
  if (packageVersions) {
    packageVersions.push(version)
  } else {
    packageVersions = npmRequestedPackageVersions[name] = [version]
  }

  delete npmPackages[key]
  npmPackages[name + version] = pkg
  return pkg
}

function getKnownMatchingVersion(name: string, range: string) {
  let rangeWithoutSymbol = range.slice(1)
  if (validRange(rangeWithoutSymbol)) {
    let versions = npmRequestedPackageVersions[name] || []
    for (let i = 0; i < versions.length; i++) {
      let version = versions[i]
      if (satisfies(version.slice(1), rangeWithoutSymbol)) {
        return version
      }
    }
  }
}

/**
 * Just responsible for fetching a package with a given key. Doesn't worry
 * where the package actually goes, or how it affects any registries.
 */
async function fetchPackage(key: string) {
  // Fetch these both in parallel, as we need them both
  let metaPromise = fetch('https://unpkg.com/' + key + '/?meta')
  let packagePromise = fetch('https://unpkg.com/' + key + '/package.json')

  let metaResponse = await metaPromise
  let packageResponse = await packagePromise

  if (!metaResponse.ok) {
    throw metaResponse
  }
  if (!packageResponse.ok) {
    throw packageResponse
  }

  let pkg = await packageResponse.json()
  let meta = await metaResponse.json()
  pkg.meta = createFilesMaps(meta)
  return pkg
}

const createFilesMaps = (directory: any): NPMFiles => ({
  ...directory,
  files: new Map(
    directory.files.map((x: any) => mapFile(x, directory.path.length)),
  ),
})

const mapFile = (file: NPMFile | NPMDirectory, slice: number) => [
  file.path.slice(slice).replace(/^\//, ''),
  file.type === 'file' ? file : createFilesMaps(file),
]

const isNotBlankString = (x: any) => x !== ''

function normalizePathsObject(paths: { [key: string]: string }) {
  let normalizedPaths = {} as { [pathname: string]: string }
  let keys = Object.keys(paths)
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    let path = paths[key]
    if (!path) {
      // Some paths pass in 'false'
      continue
    }
    normalizedPaths[join('/', key)] = join('/', paths[key])
  }
  return normalizedPaths
}
