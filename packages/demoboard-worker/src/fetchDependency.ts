/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */
/* eslint-disable import/no-webpack-loader-syntax */

import LRU from 'lru-cache'
import { FetchResult } from 'polestar'
import {
  DemoboardFileNotFoundError,
  DemoboardFetchFailedError,
} from './DemoboardBuildErrors'
import findDependenciesAndTransformModules from './findDependenciesAndTransformModules'
import { resolve, getPackage } from './npm'
import { DemoboardWorkerTransformedModule } from './types'

// The list of extensions to look for when a demoboard imports a local file
// without an extension, e.g. `import './App'`,
const extensions = ['.js', '.jsx', '.md', '.mdx']

// Some packages without any dependencies can be imported as UMD bundles from
// unpkg. These are preferred, as they include a list of dependencies that can
// be accessed at runtime, SO WE DON'T NEED TO RUN THE ENTIRE PACKAGE'S SOURCE
// THROUGH BABEL BEFORE RUNNING IT. This improves performance... significantly.
const UMD: { [name: string]: (version: string) => string } = {
  '@frontarm/demoboard': version =>
    process.env.NODE_ENV === 'production' || process.env.UMD
      ? `https://unpkg.com/@frontarm/demoboard${version}/dist/umd/demoboard.js`
      : require('!!file-loader!@frontarm/demoboard/dist/umd/demoboard.js'),
  history: version => `https://unpkg.com/history${version}/umd/history.js`,
  navi: version => `https://unpkg.com/navi${version}/dist/umd/navi.js`,
  react: version =>
    `https://unpkg.com/react${version}/umd/react.development.js`,
  'react-dom': version =>
    `https://unpkg.com/react-dom${version}/umd/react-dom.development.js`,
  'react-is': version =>
    `https://unpkg.com/react-is${version}/umd/react-is.development.js`,
  'react-navi': version =>
    `https://unpkg.com/react-navi${version}/dist/umd/react-navi.js`,
  'styled-components': version =>
    `https://unpkg.com/styled-components${version}/dist/styled-components.min.js`,
}

const vfsURLPattern = /^vfs:\/\//
const npmPattern = /^(?:npm:\/\/)?((?:@[\w.-]+\/)?\w[\w.-]+)(@[^/]+)?(\/.*)?$/
const unpkgURLPattern = /^https:\/\/unpkg\.com\/((?:@[\w.-]+\/)?\w[\w.-]+)(@[^/]+)?(\/.*)?$/

// A cache of our packages with max 500 entries
const cache = new LRU(500)

export async function fetchDependency(options: {
  dependencies: {
    [name: string]: string
  }
  mocks: {
    [name: string]: string
  }
  originalRequest: string
  requiredById: string
  transformedModules: {
    [name: string]: DemoboardWorkerTransformedModule
  }
  url: string
}) {
  let { url, requiredById, originalRequest, transformedModules } = options
  let sourceFile = requiredById
    ? requiredById.replace('vfs://', '')
    : '[anonymous]'

  if (vfsURLPattern.test(url)) {
    let id = url
    let remaining = url.replace(vfsURLPattern, '')
    let transpiledModule = transformedModules[remaining]
    let searchExtensions = extensions.slice(0)
    while (!transpiledModule && searchExtensions.length) {
      let extension = searchExtensions.shift()
      id = url + extension
      transpiledModule = transformedModules[remaining + extension]
    }

    if (!transpiledModule) {
      throw new DemoboardFileNotFoundError({
        sourceFile,
        request: originalRequest,
      })
    }

    let code =
      '"use strict";' +
      transpiledModule.transformedSource +
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

  let npmMatch = url.match(npmPattern)
  if (npmMatch) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let [_, name, version, pathname = ''] = npmMatch

    if (UMD[name] && pathname === '') {
      // TODO: packages fetched from unpkg proooobably should have dependency
      // version ranges retrieved from npm too
      const dependencyVersionRanges = {} // pkg.dependencies

      const urlToFetch = UMD[name](version)
      let id = urlToFetch.replace('https://unpkg.com/', 'npm://')

      const res = await fetchSourceFile(urlToFetch, originalRequest, sourceFile)
      const source = await res.text()

      // If the retrieved version doesn't match the requested one, then
      // switch out the id's version to the retrieved one.
      const unpkgMatch = res.url.match(unpkgURLPattern)
      const unpkgVersion = unpkgMatch && unpkgMatch[2]
      if (unpkgVersion && version !== unpkgVersion) {
        id = id.replace(version, unpkgVersion)
      }

      return cacheAndReturn({
        url,
        id,
        code: source + '\n//# sourceURL=' + urlToFetch,
        dependencies: 'umd',
        dependencyVersionRanges,
      })
    } else {
      try {
        let pkg = await getPackage(name, version)
        let resolution = await resolve(name, version, pathname)
        if (resolution === null) {
          return cacheAndReturn({
            url,
            id: url,
            code: '',
            dependencies: [],
            dependencyVersionRanges: {},
          })
        } else if (resolution.status === 'notfound') {
          throw new DemoboardFetchFailedError({
            request: originalRequest,
            url: resolution.url,
            sourceFile,
            status: '404 NotFound',
          })
        }

        const id =
          'npm://' + resolution.name + resolution.version + resolution.pathname
        const dependencyVersionRanges = pkg.dependencies || {}
        // Some packages may be redirected to browser-friendly alternatives,
        // but they should keep their requested id.
        const urlToFetch =
          'https://unpkg.com/' +
          resolution.browserName +
          resolution.version +
          resolution.pathname

        let res = await fetchSourceFile(urlToFetch, originalRequest, sourceFile)
        let source = await res.text()
        let dependencies: string[]
        if (/\.json$/.test(urlToFetch)) {
          source = 'module.exports = ' + source
          dependencies = []
        } else {
          let output = await findDependenciesAndTransformModules(source)
          source = output.code
          dependencies = Array.from(new Set(output.dependencies))
        }

        return cacheAndReturn({
          url,
          id,
          code: source + '\n//# sourceURL=' + urlToFetch,
          dependencies,
          dependencyVersionRanges,
        })
      } catch (res) {
        if (res.url) {
          throw new DemoboardFetchFailedError({
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

  // Let's disallow allow anything other than vfs/npm URLs
  throw new DemoboardFetchFailedError({
    request: originalRequest,
    url,
    sourceFile,
    status: '403 Forbidden',
  })
}

async function fetchSourceFile(
  urlToFetch: string,
  originalRequest: string,
  sourceFile: string,
) {
  let res = await fetch(urlToFetch, { credentials: 'same-origin' })

  if (!res.ok) {
    throw new DemoboardFetchFailedError({
      request: originalRequest,
      url: urlToFetch,
      sourceFile,
      status: res.status + ' ' + res.statusText,
    })
  }

  return res
}

function cacheAndReturn({
  url,
  id,
  code,
  dependencies,
  dependencyVersionRanges,
}: FetchResult) {
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

function getFromCache(url: string) {
  let result = cache.get(url)
  if (result) {
    return Object.assign({ url }, result)
  }
}

function getSourceMapURL(map: any) {
  return (
    'data:application/json;charset=utf-8;base64,' +
    btoa(unescape(encodeURIComponent(JSON.stringify(map))))
  )
}
