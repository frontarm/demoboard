import React from 'react'
import { Demoboard, DemoboardGlobalStyles } from '@frontarm/demoboard'
import './App.css'

const initialSources = {
  '/index.js': `const element = document.createElement('h1')
element.innerHTML = "Hello, world!"
document.getElementById('root').appendChild(element)`,
}

const App: React.FC = () => {
  return (
    <>
      <DemoboardGlobalStyles />
      <Demoboard
        config={{
          initialSources,
          initialGeneratedTabs: ['/index.html'],
        }}
        id="demoboard"
        height="500px"
        width="900px"
      />
    </>
  )
}

export default App
