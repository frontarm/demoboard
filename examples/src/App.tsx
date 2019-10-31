import React from 'react'
import { Demoboard, DemoboardGlobalStyles } from '@frontarm/demoboard'
import './App.css'

const initialSources = {
  '/index.js': `let element = document.createElement('h1')
element.innerHTML = "Hello, world!"
document.body.appendChild(element)`,
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
      />
    </>
  )
}

export default App
