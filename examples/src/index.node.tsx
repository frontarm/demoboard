import chalk from 'chalk'
import finalhandler from 'finalhandler'
import fs from 'fs'
import http from 'http'
import path from 'path'
import React from 'react'
import serveStatic from 'serve-static'
import { renderToString } from 'react-dom/server'
import App from './App'

const renderer = async (request: any, response: any) => {
  // The index.html file is a template, which will have environment variables
  // and bundled scripts and stylesheets injected during the build step, and
  // placed at the location specified by `process.env.HTML_TEMPLATE_PATH`.
  //
  // To customize the rendered HTML, you can add other placeholder strings,
  // and replace them within this function -- just as %RENDERED_CONTENT% is
  // replaced. Note however that if you name the placeholder after an
  // environment variable available at build time, then it will be
  // automatically replaced by the build script.
  let template = fs.readFileSync(process.env.HTML_TEMPLATE_PATH!, 'utf8')
  let [header, footer] = template.split('%RENDERED_CONTENT%')
  let body = renderToString(<App />)
  let html = header + body + footer
  response.send(html)
}

export default renderer

// ---

function serveContainer() {
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
  serveContainer()
}
