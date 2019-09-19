export default function generateIndexHTML(pathnames: string[]) {
  let scripts = ''
  let mainIndex = pathnames.findIndex(pathname =>
    /^\/(index|main).m?jsx?$/.test(pathname),
  )

  if (pathnames.find(pathname => /index\.html$/.test(pathname))) {
    return {}
  }

  if (mainIndex >= 0) {
    scripts = `    <script type="module" src="${pathnames[mainIndex].slice(
      1,
    )}"></script>`
  } else {
    scripts = pathnames
      .filter(name => /\.jsx?$/.test(name))
      .map(name => `    <script src="${name}"><\/script>`)
      .join('\n')
  }

  let indexHTML = `<!DOCTYPE html>
<html>
  <head>
    <title>Untitled App</title>
${pathnames
  .filter(
    name =>
      /\.s?css$/.test(name) &&
      !/\.module\.s?css$/.test(name) &&
      name !== 'markdown.css',
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
