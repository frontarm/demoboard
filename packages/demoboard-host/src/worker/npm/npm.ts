import { join } from 'path'
import { valid, validRange, satisfies } from 'semver'
import browserCore from './browserCore'
import {
  NPMPackage,
  NPMResolution,
  NPMFile,
  NPMFiles,
  NPMDirectory,
} from './types'

// todo: store resolved versions based on URL redirects, then
// in the future, resolve matching versions ourself.

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

const searchSuffixes = ['.js', '/index.js']

// assumes we have an npm url (without the prototocl), then:
// - checks to find the actual url for the desired resource
// - pre-fetches the package.json
export async function resolve(
  name,
  version,
  pathname = '',
): Promise<NPMResolution> {
  let browserName = browserCore[name]
  if (browserName === null) {
    return null
  }
  if (!browserName) {
    browserName = name
  }

  // Ignore macros. They can't be implemented within the browser, but pretend
  // they exist so that things like styled-components/macro can be copy-pasted.
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
    // TODO: support named entry points, like those in react-dom's "browser" field
    let entry = pkg.unpkg || pkg.main
    if (typeof pkg.browser === 'string') {
      entry = pkg.browser
    }
    if (entry) {
      pathname = join('/', entry)
    }
  }

  let node: NPMFile | NPMDirectory = pkg.meta
  let lastNode: NPMDirectory = null
  let pathSegments = pathname.split('/').filter(isNotBlankString)
  let segment: string
  for (let i = 0; i < pathSegments.length; i++) {
    segment = pathSegments[i]
    if (!node || node.type === 'file') {
      throw {
        url: 'https://unpkg.com/' + name + version + pathname,
        status: 404,
        statusText: 'Not Found',
      }
    }
    lastNode = node
    node = node.files.get(segment)
  }

  if (node && node.type === 'directory') {
    // TODO: do this recursively
    node = node.files.get('index.js')
    if (node) {
      pathname = join(pathname, '/index.js')
    }
  }

  if (!node) {
    node = lastNode.files.get(segment + '.js')
    if (node) {
      pathname += '.js'
    }
  }

  if (!node) {
    throw {
      url: 'https://unpkg.com/' + name + version + pathname,
      status: 404,
      statusText: 'Not Found',
    }
  }

  // The `browser` field can contain an object of individual paths that should
  // be mapped to different files within the browser
  let browser =
    pkg.browser && typeof pkg.browser === 'object'
      ? normalizePathsObject(pkg.browser)
      : {}
  if (browser[pathname]) {
    pathname = browser[pathname]
  }

  return { browserName, name, version, pathname }
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

function getKnownMatchingVersion(name, range) {
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
async function fetchPackage(key) {
  // Fetch these both in parallel, as we need them both
  let metaPromise = fetch('https://unpkg.com/' + key + '/?meta')
  let packagePromise = fetch('https://unpkg.com/' + key + '/package.json')

  let metaResponse = await metaPromise

  // This seems to have been fixed, you can remove this if you find it.
  // // There's a bug in unpkg that is causing an incorrect redirect URL when
  // // a version name is used instead of a version number. This fixes it,
  // // and can be removed once the bug is fixed.
  // if (metaResponse.redirected && metaResponse.url.slice(-1) === '=') {
  //   let fixedURL = metaResponse.url.slice(0, -1)
  //   metaResponse = await fetch(fixedURL)
  // }

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

const createFilesMaps = directory => ({
  ...directory,
  files: new Map(directory.files.map(x => mapFile(x, directory.path.length))),
})

const mapFile = (file: NPMFile | NPMDirectory, slice: number) => [
  file.path.slice(slice).replace(/^\//, ''),
  file.type === 'file' ? file : createFilesMaps(file),
]

const isNotBlankString = x => x !== ''

function normalizePathsObject(paths: { [key: string]: string }) {
  let normalizedPaths = {}
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
