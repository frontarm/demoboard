/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import { DemoboardGenerator } from '../types'

const indexHTMLGenerator: DemoboardGenerator = ({
  context = {
    title: 'Untitled App',
  },
  pathnames,
}) => {
  let scripts = ''
  let mainIndex = pathnames.findIndex(pathname =>
    /^\/(index|main).m?jsx?$/.test(pathname),
  )

  if (mainIndex >= 0) {
    scripts = `    <script type="module" src="${pathnames[mainIndex].slice(
      1,
    )}"></script>`
  } else {
    scripts = pathnames
      .filter(name => /\.jsx?$/.test(name))
      .map(name => `    <script src="${name}"></script>`)
      .join('\n')
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <title>${context && context.title}</title>
${pathnames
  .filter(
    name =>
      /\.s?css$/.test(name) &&
      !/\.module\.s?css$/.test(name) &&
      name !== '/markdown.css',
  )
  .map(name => `    <link rel="stylesheet" type="text/css" href="${name}" />`)
  .join('\n')}
  </head>
  <body>
    <div id="root"></div>
${scripts}
  </body>
</html>`
}

export default indexHTMLGenerator
