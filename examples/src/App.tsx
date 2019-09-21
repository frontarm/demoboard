import React from 'react'
import {
  useDemoboardBuild,
  useDemoboardInstance,
  useDemoboardProject,
} from '@frontarm/demoboard-core'

const App: React.FC = () => {
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

  let instance = useDemoboardInstance({
    ...project.buildConfig,
  })

  return <pre>{JSON.stringify(build, null, 2)}</pre>
}

export default App
