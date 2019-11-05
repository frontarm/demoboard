import React from 'react'
import { css } from 'styled-components/macro'
import { Demoboard, DemoboardGlobalStyles } from '@frontarm/demoboard'
import DemoboardWorkerProvider from '@frontarm/demoboard-worker-provider'
import './App.css'

const trim = (strings: TemplateStringsArray, ...args: string[]) => {
  let result = strings[0].trimLeft()
  for (let i = 0; i < args.length; i++) {
    result += String(args[i])
    if (strings[i + 1]) result += strings[i + 1]
  }
  return result.trimRight()
}

const basicExample = trim`
const element = document.createElement('h1')
element.innerHTML = \`
  Hello, world!<br />
\`.repeat(10)
document.getElementById('root').appendChild(element)
`

const innerExample = trim`
import React from 'react'
import ReactDOM from 'react-dom'
import { Demoboard, DemoboardGlobalStyles } from '@frontarm/demoboard'

function App() {
  return (
    <>
      <DemoboardGlobalStyles />
      <Demoboard
        config={{
          initialSources: {
            '/index.js': ${JSON.stringify(basicExample)},
          },
          initialGeneratedTabs: ['/index.html'],
        }}
        height="300px"
        width="100%"
      />
    </>
  )
}

const node = document.getElementById("root")
ReactDOM.render(<App />, node)
`

const demoboardExample = trim`
import React from 'react'
import ReactDOM from 'react-dom'
import { Demoboard, DemoboardGlobalStyles } from '@frontarm/demoboard'

function App() {
  return (
    <>
      <DemoboardGlobalStyles />
      <Demoboard
        config={{
          initialSources: {
            '/index.js': ${JSON.stringify(innerExample)},
          },
          initialGeneratedTabs: ['/index.html'],
        }}
        height="350px"
        width="100%"
      />
      <br />
      {/*<Demoboard
        config={{
          initialSources: {
            '/index.js': "const element = document.createElement(",
          },
          initialGeneratedTabs: ['/index.html'],
        }}
        height="350px"
        width="100%"
      />*/}
    </>
  )
}

const node = document.getElementById("root")
ReactDOM.render(<App />, node)
`

const App: React.FC = () => {
  return (
    <>
      <DemoboardWorkerProvider>
        <DemoboardGlobalStyles />
        <Demoboard
          config={{
            initialSources: {
              '/index.js': demoboardExample,
              // '/index.js': basicExample,
            },
            initialGeneratedTabs: ['/index.html'],
          }}
          css={css`
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          `}
        />
      </DemoboardWorkerProvider>
    </>
  )
}

export default App
