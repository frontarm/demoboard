import React from 'react'
import {
  useDemoboardBuild,
  useDemoboardProject,
} from '@frontarm/demoboard-core'

function App() {
  let project = useDemoboardProject({
    config: {
      initialSources: {
        '/index.js': 'console.log("hello, world!")',
      },
    },
  })

  let build = useDemoboardBuild({
    ...project.buildConfig,
  })

  return <div>Demoboard</div>
}

export default App
