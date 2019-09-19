/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */
import { FileNotFoundError } from './DemoboardBuildErrors'
import { normalizeReferencedPathname } from '../utils/normalizeReferencedPathname'

const developmentRuntime = require('file-loader!@frontarm/demoboard-runtime/dist/demoboard-runtime.js')
const productionRuntime = require('file-loader!@frontarm/demoboard-runtime/dist/demoboard-runtime.min.js')

const runtimeURL =
  process.env.PUBLIC_URL +
  (process.env.NODE_ENV === 'production'
    ? productionRuntime
    : developmentRuntime)
const SCRIPT_TYPE = 'text/javascript'

function createDataURL(str, type = SCRIPT_TYPE) {
  return (
    `data:${type};charset=utf-8;base64,` +
    btoa(unescape(encodeURIComponent(str)))
  )
}

function getSourceMapURL(map) {
  return (
    'data:application/json;charset=utf-8;base64,' +
    btoa(unescape(encodeURIComponent(JSON.stringify(map))))
  )
}

const BaseURL = 'https://demoboard.frontarm.com'

/**
 * Convert a file into something runnable
 */
export default function generateDemoboardHTML(
  viewerPathname,
  transpiledModules,
) {
  let viewerTranspiledModule = transpiledModules[viewerPathname]
  let modulePaths = Object.keys(transpiledModules)

  // Fall back to index.html unless the user is looking for a markdown/js file
  if (!viewerTranspiledModule && !/\.(mdx?|jsx?)$/.test(viewerPathname)) {
    viewerTranspiledModule = transpiledModules['/index.html']
  }

  if (!viewerTranspiledModule) {
    return
  }

  let viewerHTML = viewerTranspiledModule.code
  let hasModule = false
  if (/\.jsx?/.test(viewerPathname)) {
    viewerHTML = `<script type="module" src="${viewerPathname}"></script>`
  } else if (/\.mdx?/.test(viewerPathname)) {
    let originalCode = viewerTranspiledModule.originalCode

    let originalReactMatch = originalCode.match(
      /import\s+React\s+from (?:'|")react(@.*)?(?:'|")/,
    )
    let originalReactVersion =
      (originalReactMatch && originalReactMatch[1]) || '@latest'

    let stringifiedModuleURL = JSON.stringify(
      'demoboard-fs://' + viewerPathname,
    )
    let bootstrapCode = `
      var React = require('react${originalReactVersion}')
      require('react-dom${originalReactVersion}').render(
        React.createElement(
          require(${stringifiedModuleURL}).default,
          {
            components: {
              a: function (props) {
                return React.createElement('a', Object.assign({
                  target: props.href && props.href.indexOf('//') !== -1 ? '_blank' : undefined,
                }, props))
              },
              code: function (props) {
                let propsCopy = Object.assign({}, props)
                delete propsCopy.metaString
                return React.createElement('code', propsCopy)
              },
            }
          }
        ),
        document.getElementById('root')
      )
    `
    let links = modulePaths
      .filter(name => /\.s?css$/.test(name))
      .map(name => `<link rel="stylesheet" type="text/css" href="${name}" />`)
      .join('\n')

    hasModule = true
    viewerHTML = `
      ${links}
      <div id="root"></div>
      <script>
        window.demoboardRuntime.evaluate(['react${originalReactVersion}', 'react-dom${originalReactVersion}', ${stringifiedModuleURL}], ${JSON.stringify(
      bootstrapCode,
    )});
      </script>
    `
  }

  if (!viewerHTML) {
    return undefined
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(viewerHTML, 'text/html')
  const head = doc.head

  // Add a temporary base to prevent `src`/`href` attributes from being
  // treated as relative to the parent page's current URL, and to allow
  // detection of non-absolute URLs.
  const base = doc.createElement('base')
  base.href = BaseURL
  if (head.childNodes[0]) {
    head.insertBefore(base, head.childNodes[0])
  } else {
    head.appendChild(base)
  }

  // Find <script module src> tags, and replace their src URL with an object
  // that contains the wrapped module source.
  const moduleScriptNodes = doc.querySelectorAll('script[type=module]')
  for (let i = moduleScriptNodes.length - 1; i >= 0; i--) {
    let scriptElement = moduleScriptNodes[i] as HTMLScriptElement
    let scriptSource
    if (scriptElement.src) {
      if (scriptElement.src.indexOf(BaseURL) === 0) {
        let parser = document.createElement('a')
        parser.href = scriptElement.src
        let moduleName = normalizeReferencedPathname(
          parser.pathname,
          viewerPathname,
        )
        let transpiledModule = transpiledModules[moduleName]
        if (transpiledModule === undefined) {
          throw new FileNotFoundError({
            sourceFile: viewerPathname,
            request: moduleName,
          })
        }
        hasModule = true
        scriptSource =
          `window.demoboardRuntime.require(` +
          JSON.stringify('demoboard-fs://' + moduleName) +
          ')'

        scriptElement.innerHTML = scriptSource
        scriptElement.removeAttribute('src')
        scriptElement.removeAttribute('type')
      }
    } else {
      throw new Error(
        `Demoboard currently only support <script type="module"> tags when they have a "src" attribute.`,
      )
    }
  }

  const nonModuleScriptNodes = doc.querySelectorAll('script[src]')
  for (let i = nonModuleScriptNodes.length - 1; i >= 0; i--) {
    let scriptElement = nonModuleScriptNodes[i] as HTMLScriptElement
    if (scriptElement.src.indexOf(BaseURL) === 0) {
      let parser = document.createElement('a')
      parser.href = scriptElement.src
      let moduleName = normalizeReferencedPathname(
        parser.pathname,
        viewerPathname,
      )
      let transpiledModule = transpiledModules[moduleName]
      if (transpiledModule === undefined) {
        throw new FileNotFoundError({
          sourceFile: viewerPathname,
          request: moduleName,
        })
      }
      hasModule = true
      scriptElement.innerHTML = `window.demoboardRuntime.evaluate([], ${JSON.stringify(
        transpiledModule.code,
      )})`
      scriptElement.removeAttribute('src')
    }
  }

  // If there are no modules, we'll need to send "init" manually
  if (!hasModule) {
    let initScript = doc.createElement('script')
    initScript.innerHTML = 'window.demoboardRuntime.evaluate([], "");'
    doc.body.appendChild(initScript)
  }

  // Insert our runtime at the top of the head, so that it runs before
  // anything else is run.
  const setupRuntime = document.createComment('DEMOBOARD_SETTINGS')
  const runtimeScript = doc.createElement('script')
  runtimeScript.src = runtimeURL
  if (head.childNodes.length > 0) {
    head.insertBefore(setupRuntime, head.childNodes[0])
  } else {
    head.appendChild(setupRuntime)
  }
  head.insertBefore(runtimeScript, setupRuntime)

  // Find <link rel="stylesheet"> tags, and replace their href URL with an
  // object URL.
  const linkStyleNodes = doc.querySelectorAll('link[rel="stylesheet"]')
  for (let i = linkStyleNodes.length - 1; i >= 0; i--) {
    let linkElement = linkStyleNodes[i] as HTMLLinkElement
    if (linkElement.href && linkElement.href.indexOf(BaseURL) === 0) {
      let parser = document.createElement('a')
      parser.href = linkElement.href
      let stylesheetPathname = normalizeReferencedPathname(
        parser.pathname,
        viewerPathname,
      )
      let transpiledModule = transpiledModules[stylesheetPathname]
      if (
        transpiledModule === undefined ||
        (transpiledModule as any) instanceof Error
      ) {
        throw new FileNotFoundError({
          sourceFile: viewerPathname,
          request: stylesheetPathname,
        })
      }
      linkElement.href = createDataURL(transpiledModule.css, 'text/css')
      linkElement.parentNode.insertBefore(
        document.createComment(stylesheetPathname + ': '),
        linkElement,
      )
    }
  }

  head.removeChild(base)

  return doc.documentElement.innerHTML
}
