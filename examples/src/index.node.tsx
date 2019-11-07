import chalk from 'chalk'
import finalhandler from 'finalhandler'
import fs from 'fs'
import http from 'http'
import path from 'path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import serveStatic from 'serve-static'
import { ServerStyleSheet } from 'styled-components/macro'
import App from './App'
import { DemoboardGlobalStyles } from '@frontarm/demoboard'

const renderer = async (request: any, response: any) => {
  let sheet: ServerStyleSheet | undefined

  // Read in a HTML template, into which we'll substitute React's rendered
  // content, styles, and Navi's route state.
  let template = fs.readFileSync(process.env.HTML_TEMPLATE_PATH!, 'utf8')
  let [header, footer] = template.split('<div id="root">%RENDERED_CONTENT%')

  try {
    sheet = new ServerStyleSheet()

    let body = renderToString(
      sheet!.collectStyles(
        <>
          <DemoboardGlobalStyles />
          <App />
        </>,
      ),
    )

    // Generate stylesheets containing the minimal CSS necessary to render the
    // page. The rest of the CSS will be loaded at runtime.
    let styleTags = sheet.getStyleTags()

    // Generate the complete HTML
    let html = header + styleTags + '<div id="root">' + body + footer

    // The route status defaults to `200`, but can be set to other statuses by
    // passing a `status` option to `route()`
    response.status(200).send(html)
  } catch (error) {
    // Log an error, but only render it in development mode.
    let html
    console.error(error)
    if (process.env.NODE_ENV === 'production') {
      html = `<h1>500 Error - Something went wrong.</h1>`
    } else {
      html = `<h1>500 Error</h1><pre>${String(error)}</pre>` + header + footer
    }
    response.status(500).send(html)
  } finally {
    if (sheet) {
      sheet.seal()
    }
  }
}

export default renderer

// ---

function serveDependencies() {
  // Serve the demoboard runtime on a separate origin
  const demoboardContainerPort = 5000
  const demoboardRuntimeDistPath = path.dirname(
    require.resolve('@frontarm/demoboard-runtime'),
  )
  console.log(
    chalk.cyan(
      `Serving demoboard runtime on port ${demoboardContainerPort}...`,
    ),
  )
  var serve = serveStatic(demoboardRuntimeDistPath)
  var server = http.createServer(function onRequest(req: any, res: any) {
    serve(req, res, finalhandler(req, res))
  })
  server.listen(demoboardContainerPort)
}

if (!(global as any).hasStartedContainerServer) {
  ;(global as any).hasStartedContainerServer = true
  serveDependencies()
}
