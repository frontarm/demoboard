import React from 'react'
import { useDemoboardProject } from '@frontarm/demoboard-core'

function App() {
  let project = useDemoboardProject({
    config: {
      initialSources: {
        '/index.js': 'console.log("hello, world!")',
      },
    },
  })

  return <div>Demoboard</div>
}

export default App
