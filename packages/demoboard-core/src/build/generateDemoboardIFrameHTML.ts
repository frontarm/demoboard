/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */
import { DemoboardFileNotFoundError } from './DemoboardBuildErrors'
import { normalizeReferencedPathname } from '../utils/normalizeReferencedPathname'
import { DemoboardWorkerTransformedModule } from '../types'

function createDataURL(str: string, type = 'text/javascript') {
  return (
    `data:${type};charset=utf-8;base64,` +
    btoa(unescape(encodeURIComponent(str)))
  )
}

/**
 * Convert a file into something runnable
 */
export default function generateDemoboardHTML(
  entryPathname: string,
  transformedModules: { [pathname: string]: DemoboardWorkerTransformedModule },
  baseURL: string,
  runtimeURL: string,
): string {
  let transpiledModule = transformedModules[entryPathname]
  if (!transpiledModule) {
    throw new Error(`Couldn't find source for your entry point.`)
  }

  let pathnames = Object.keys(transformedModules)
  let entrySource = transpiledModule.transformedSource

  // Keep track of whether we've evaluated or required anything with polestar.
  // If not, we'll need to add an evaluation at the end to ensure that the
  // init event is sent.
  let hasScriptThatPerformsInit = false

  // If the entry point is a JavaScript file, then generate a single-line HTML
  // file to load it.
  if (/\.jsx?/.test(entryPathname)) {
    entrySource = `<script type="module" src="${entryPathname}"></script>`
    // If the entry point is a Markdown or MDX file, we'll create a React-based
    // script to load it.
  } else if (/\.mdx?/.test(entryPathname)) {
    let originalCode = transpiledModule.originalSource

    let originalReactMatch = originalCode.match(
      /import\s+React\s+from (?:'|")react(@.*)?(?:'|")/,
    )
    let originalReactVersion =
      (originalReactMatch && originalReactMatch[1]) || '@latest'

    // Create a script that loads and renders the MDX file
    let stringifiedModuleURL = JSON.stringify('vfs://' + entryPathname)
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
)`
    // Add any markdown or mdx stylesheet
    let links = pathnames
      .filter(name => /(markdown|mdx)\.s?css$/.test(name))
      .map(name => `<link rel="stylesheet" type="text/css" href="${name}" />`)
      .join('\n')

    hasScriptThatPerformsInit = true
    entrySource = `
${links}
<div id="root"></div>
<script>
  window.demoboardRuntime.evaluate(['react${originalReactVersion}', 'react-dom${originalReactVersion}', ${stringifiedModuleURL}], ${JSON.stringify(
      bootstrapCode,
    )});
</script>`
  }

  if (!entrySource) {
    throw new Error(`Couldn't find source for your entry point.`)
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(entrySource, 'text/html')
  const head = doc.head

  // Add a temporary base to prevent `src`/`href` attributes from being
  // treated as relative to the parent page's current URL, and to allow
  // detection of non-absolute URLs.
  const base = doc.createElement('base')
  base.href = baseURL
  if (head.childNodes[0]) {
    head.insertBefore(base, head.childNodes[0])
  } else {
    head.appendChild(base)
  }

  // Find <script module> tags, and replace them with a script that requires
  // the module with polestar.
  const moduleScriptNodes = doc.querySelectorAll('script[type=module]')
  for (let i = moduleScriptNodes.length - 1; i >= 0; i--) {
    let scriptElement = moduleScriptNodes[i] as HTMLScriptElement
    let scriptSource
    if (scriptElement.src) {
      // Don't transform any external scripts
      if (scriptElement.src.indexOf(baseURL) === 0) {
        let parser = document.createElement('a')
        parser.href = scriptElement.src
        let moduleName = normalizeReferencedPathname(
          parser.pathname,
          entryPathname,
        )
        let transpiledModule = transformedModules[moduleName]
        if (transpiledModule === undefined) {
          throw new DemoboardFileNotFoundError({
            sourceFile: entryPathname,
            request: moduleName,
          })
        }
        hasScriptThatPerformsInit = true
        scriptSource =
          `window.demoboardRuntime.require(` +
          JSON.stringify('vfs://' + moduleName) +
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

  // Find remaining <script src> tags, and evluate them with polestar.
  const nonModuleScriptNodes = doc.querySelectorAll('script[src]')
  for (let i = nonModuleScriptNodes.length - 1; i >= 0; i--) {
    let scriptElement = nonModuleScriptNodes[i] as HTMLScriptElement
    if (scriptElement.src.indexOf(baseURL) === 0) {
      let parser = document.createElement('a')
      parser.href = scriptElement.src
      let moduleName = normalizeReferencedPathname(
        parser.pathname,
        entryPathname,
      )
      let transpiledModule = transformedModules[moduleName]
      if (transpiledModule === undefined) {
        throw new DemoboardFileNotFoundError({
          sourceFile: entryPathname,
          request: moduleName,
        })
      }
      hasScriptThatPerformsInit = true
      scriptElement.innerHTML = `window.demoboardRuntime.evaluate([], ${JSON.stringify(
        transpiledModule.transformedSource,
      )})`
      scriptElement.removeAttribute('src')
    }
  }

  // If there are no modules, we'll need to send "init" manually
  if (!hasScriptThatPerformsInit) {
    let initScript = doc.createElement('script')
    initScript.innerHTML = 'window.demoboardRuntime.evaluate([], "");'
    doc.body.appendChild(initScript)
  }

  // Insert our runtime at the top of the head, so that it runs before
  // anything else is run, along with a comment that must be replaced
  // with the settings.
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
    if (linkElement.href && linkElement.href.indexOf(baseURL) === 0) {
      let parser = document.createElement('a')
      parser.href = linkElement.href
      let stylesheetPathname = normalizeReferencedPathname(
        parser.pathname,
        entryPathname,
      )
      let transpiledModule = transformedModules[stylesheetPathname]
      if (transpiledModule === undefined) {
        throw new DemoboardFileNotFoundError({
          sourceFile: entryPathname,
          request: stylesheetPathname,
        })
      }
      if (transpiledModule.css === null) {
        throw new Error(
          `The module "${stylesheetPathname}" was referenced in a <link rel="stylesheet"> tag, but does not appear to be a css module.`,
        )
      }
      linkElement.href = createDataURL(transpiledModule.css, 'text/css')
      linkElement.parentNode!.insertBefore(
        document.createComment(stylesheetPathname + ': '),
        linkElement,
      )
    }
  }

  head.removeChild(base)

  return doc.documentElement.innerHTML
}
