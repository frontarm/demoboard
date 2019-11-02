import React from 'react'
import { Demoboard, DemoboardGlobalStyles } from '@frontarm/demoboard'
import './App.css'

const App: React.FC = () => {
  return (
    <>
      <DemoboardGlobalStyles />
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
    </>
  )
}

export default App
