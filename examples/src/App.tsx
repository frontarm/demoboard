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
import { Demoboard, DemoboardGlobalStyles } from '@frontarm/demoboard'

# Welcome to Demoboard

Demoboard is a lightweight live JavaScript editor, which lets you import anything from NPM.

<DemoboardGlobalStyles />
<Demoboard
  config={{
    initialSources: {
      '/index.js': ${JSON.stringify(innerExample)},
    },
    initialGeneratedTabs: ['/index.html'],
  }}
  height="350px"
  width="calc(100% - 2rem)"
  style={{
    margin: '1rem'
  }}
/>

It supports JSX and MDX out of the box.

<Demoboard
  config={{
    initialSources: {
      '/index.js': ${JSON.stringify(basicExample)},
    },
  }}
  height="350px"
  width="calc(100% - 2rem)"
  style={{
    margin: '1rem'
  }}
/>

And it's 🔥 [Blazing Fast](https://twitter.com/acdlite/status/974390255393505280?lang=en) 🔥

<Demoboard
  config={{
    initialSources: {
      '/index.js': "const element = document.createElement(",
    },
    initialGeneratedTabs: ['/index.html'],
  }}
  height="350px"
  width="calc(100% - 2rem)"
  style={{
    margin: '1rem'
  }}
/>
`

const App: React.FC = () => {
  return (
    <>
      <DemoboardWorkerProvider>
        <DemoboardGlobalStyles />
        <Demoboard
          config={{
            initialSources: {
              '/README.mdx': demoboardExample,
            },
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
