import React from 'react'
import { css } from 'styled-components/macro'
import { Demoboard, DemoboardGlobalStyles } from '@frontarm/demoboard'
import DemoboardWorkerProvider from '@frontarm/demoboard-worker-provider'
import './App.css'

const rawExample = trim`
const element = document.createElement('h1')
element.innerHTML = \`
  Hello, world!<br />
\`.repeat(10)
document.getElementById('root').appendChild(element)
`

const reakitExample = trim`
import React from "react";
import ReactDOM from "react-dom";
import { Button } from "reakit/Button";

function App() {
  return (
    <div>
      <h1>Hello Reakit</h1>
      <Button>
        I'm a reakit button!
      </Button>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
`

const materialExample = trim`
import Button from "@material-ui/core/Button";

# Hello World

<p>
<Button color='secondary'>
I'm a material button!
</Button>
</p>
`

const rebassExample = trim`
import { Button } from "rebass";

# Hello World

<p>
<Button bg='lightgray' color='black' mr={2}>
I'm a rebass button!
</Button>
</p>
`

const demoboardExample = trim`
import { Demoboard, DemoboardGlobalStyles } from '@frontarm/demoboard'

# Welcome to Demoboard

Demoboard is a lightweight live JavaScript editor, which lets you import anything from NPM.

<DemoboardGlobalStyles />
<Demoboard
  config={{
    initialSources: {
      '/index.js': ${JSON.stringify(rawExample)},
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
      '/index.js': ${JSON.stringify(reakitExample)},
    },
    initialGeneratedTabs: ['/index.html'],
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
      '/README.mdx': ${JSON.stringify(materialExample)},
    },
  }}
  height="350px"
  width="calc(100% - 2rem)"
  style={{ margin: '1rem' }}
/>

<Demoboard
  config={{
    initialSources: {
      '/README.mdx': ${JSON.stringify(rebassExample)},
    },
  }}
  height="350px"
  width="calc(100% - 2rem)"
  style={{ margin: '1rem' }}
/>
`

const App = () => {
  return (
    <>
      {/* <DemoboardWorkerProvider> */}
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
      {/* </DemoboardWorkerProvider> */}
    </>
  )
}

function trim(strings: TemplateStringsArray, ...args: string[]) {
  let result = strings[0].trimLeft()
  for (let i = 0; i < args.length; i++) {
    result += String(args[i])
    if (strings[i + 1]) result += strings[i + 1]
  }
  return result.trimRight()
}

export default App
