Demoboard
=========

An embeddable live editor, with every package on npm.


Getting Started
---------------

Demoboard can be embedded within any app built with Webpack -- including apps built with Create React App, Gatsby, Next.js, etc.

```bash
yarn add @frontarm/demoboard
```

```js
import React from 'react'
import { Demoboard, DemoboardGlobalStyles } from '@frontarm/demoboard'

const initialSources = {
  '/index.js': `
import React from 'react@experimental'
import ReactDOM from 'react-dom@experimental'

const root = ReactDOM.createRoot(
  document.getElementById('root')
)
root.render(<h1>Hello, world!</h1>)`,
}

const App = () => {
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
```



Contributing
------------

```bash
yarn install
yarn build
cd examples
yarn start
```