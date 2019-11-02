import React from 'react'
import { Demoboard, DemoboardGlobalStyles } from '@frontarm/demoboard'
import DemoboardWorkerProvider from '@frontarm/demoboard-worker-provider'
import './App.css'

const App: React.FC = () => {
  return (
    <>
      <DemoboardGlobalStyles />
      <DemoboardWorkerProvider>
        <Demoboard
          config={{
            initialSources: {
              '/index.js': `const element = document.createElement('h1')
element.innerHTML = "Hello, world!"
document.getElementById('root').appendChild(element)`,
            },
            initialGeneratedTabs: ['/index.html'],
          }}
          height="350px"
          width="900px"
        />
        <br />
        <Demoboard
          config={{
            initialSources: {
              '/index.js': `const element = document.createElement(`,
            },
            initialGeneratedTabs: ['/index.html'],
          }}
          height="350px"
          width="900px"
        />
      </DemoboardWorkerProvider>
    </>
  )
}

export default App
