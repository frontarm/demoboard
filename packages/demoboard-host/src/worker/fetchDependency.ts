import { transform } from '@babel/standalone'
import LRU from 'lru-cache'
import {
  FileNotFoundError,
  FetchFailedError,
} from '../build/DemoboardBuildErrors'
import { resolve, getPackage } from './npm'
import babelPluginDetective from './transforms/babel-plugin-detective'

// Create a cache with at maximum 500 entries
const cache = new LRU(500)
function cacheAndReturn({
  url,
  id,
  code,
  dependencies,
  dependencyVersionRanges,
}) {
  let result = {
    id,
    code,
    url,
    dependencies,
    dependencyVersionRanges,
  }
  cache.set(url, result)
  cache.set(id, result)
  return result
}
function getFromCache(url) {
  let result = cache.get(url)
  if (result) {
    return Object.assign({ url }, result)
  }
}

// Some packages without any dependencies can be imported as UMD bundles from
// unpkg. These are preferred, as they include a list of dependencies that can
// be accessed at runtime, and generally result in less HTTP requests.
// I specify versions for these as waiting for a redirect from UNPKG can take
// a lot of time.
const UMD = {
  react: (version = '@16.8.4') =>
    `https://unpkg.com/react${version}/umd/react.development.js`,
  'react-dom': (version = '@16.8.4') =>
    `https://unpkg.com/react-dom${version}/umd/react-dom.development.js`,
  history: (version = '@4.7.2') =>
    `https://unpkg.com/history${version}/umd/history.js`,
  navi: (version = '@0.12.6') =>
    `https://unpkg.com/navi${version}/dist/umd/navi.js`,
  'react-navi': (version = '@0.12.6') =>
    `https://unpkg.com/react-navi${version}/dist/umd/react-navi.js`,
}

function getSourceMapURL(map) {
  return (
    'data:application/json;charset=utf-8;base64,' +
    btoa(unescape(encodeURIComponent(JSON.stringify(map))))
  )
}

const demoboardFSURLPattern = /^demoboard-fs:\/\//
const npmPattern = /^(?:npm:\/\/)?((?:@[\w\.\-]+\/)?\w[\w\.\-]+)(@[^\/]+)?(\/.*)?$/
const extensions = ['.js', '.jsx', '.md', '.mdx']

export async function fetchDependency(
  {
    url,
    requiredById,
    originalRequest,
  }: { url: string; requiredById: string; originalRequest },
  transpiledModules: {
    [name: string]: {
      code: string
      map?: any
      dependencies: string[]
      css?: string
    }
  },
) {
  let sourceFile = requiredById
    ? requiredById.replace('demoboard-fs://', '')
    : '[anonymous]'

  if (demoboardFSURLPattern.test(url)) {
    let id = url
    let remaining = url.replace(demoboardFSURLPattern, '')
    let transpiledModule = transpiledModules[remaining]
    let searchExtensions = extensions.slice(0)
    while (!transpiledModule && searchExtensions.length) {
      let extension = searchExtensions.shift()
      id = url + extension
      transpiledModule = transpiledModules[remaining + extension]
    }

    if (!transpiledModule) {
      throw new FileNotFoundError({
        sourceFile,
        request: originalRequest,
      })
    }

    let code =
      '"use strict";' +
      transpiledModule.code +
      '\n//# sourceURL=' +
      url.replace(/^.*:\/\//, '') +
      '\n//# sourceMappingURL=' +
      getSourceMapURL(transpiledModule.map)

    return {
      id,
      url,
      code,
      css: transpiledModule.css,
      dependencies: Array.from(new Set(transpiledModule.dependencies)),
      dependencyVersionRanges: {},
    }
  }

  // Don't check cache until after checking filesystem, as the user can edit
  // filesystem files.
  let cachedValue = getFromCache(url)
  if (cachedValue) {
    return cachedValue
  }

  let id = url
  let dependencyVersionRanges = {}
  let urlToFetch = url
  let isUMD = false
  let npmMatch = url.match(npmPattern)
  if (npmMatch) {
    let [_, name, version, pathname = ''] = npmMatch

    if (UMD[name] && pathname === '') {
      // Use hardcoded versions for UMDs to avoid redirects. This means in
      // many cases we won't have to hit the server at all.
      if (version === '@latest') {
        version = undefined
      }

      // TODO: don't fetch meta for UMD deps, and instead of fetching each
      // package.json, would be better to have an endpoint somewhere that
      // resolves versions for a group of dependencies at once -- just as
      // stackblitz does.
      // let pkg = await getPackage(name, version)

      dependencyVersionRanges = {} // pkg.dependencies
      urlToFetch = UMD[name](version)
      id = urlToFetch.replace('https://unpkg.com/', 'npm://')
      isUMD = true
    } else {
      try {
        let pkg = await getPackage(name, version)
        let resolution = await resolve(name, version, pathname)

        if (!resolution) {
          return cacheAndReturn({
            url,
            id: url,
            code: '',
            dependencies: [],
            dependencyVersionRanges: {},
          })
        }

        id =
          'npm://' + resolution.name + resolution.version + resolution.pathname
        dependencyVersionRanges = pkg.dependencies || {}
        // Some packages may be redirected to browser-friendly alternatives,
        // bu they should keep their requested id.
        urlToFetch =
          'https://unpkg.com/' +
          resolution.browserName +
          resolution.version +
          resolution.pathname
      } catch (res) {
        if (res.url) {
          throw new FetchFailedError({
            request: originalRequest,
            url: res.url,
            sourceFile,
            status: res.status + ' ' + res.statusText,
          })
        } else {
          console.error(res)
          throw res
        }
      }
    }
  }

  let res = await fetch(urlToFetch, { credentials: 'same-origin' })
  if (!res.ok) {
    throw new FetchFailedError({
      request: originalRequest,
      url: urlToFetch,
      sourceFile,
      status: res.status + ' ' + res.statusText,
    })
  }
  let source = await res.text()
  let dependencies
  if (/\.json$/.test(urlToFetch)) {
    source = 'module.exports = ' + source
    dependencies = []
  } else {
    dependencies = isUMD ? 'umd' : Array.from(new Set(findDependencies(source)))
  }

  return cacheAndReturn({
    url,
    id,
    code: source + '\n//# sourceURL=' + urlToFetch,
    dependencies,
    dependencyVersionRanges,
  })
}

// TODO: convert this from a babel plugin to a function that walks an ast,
// and then just return the ast as part of the transpiler output.
function findDependencies(source) {
  let babelOutput = transform(source, {
    plugins: ['syntax-object-rest-spread', babelPluginDetective],

    compact: false,
    sourceMaps: false,
    sourceType: 'module',
  })

  return babelOutput.metadata.requires || []
}
