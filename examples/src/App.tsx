import React from 'react'
import {
  DemoboardInstanceIFrame,
  useDemoboardBuild,
  useDemoboardInstance,
  useDemoboardProject,
} from '@frontarm/demoboard-core'
import './App.css'

const App: React.FC = () => {
  let project = useDemoboardProject({
    config: {
      initialSources: {
        '/index.js': `let element = document.createElement('h1')
element.innerHTML = "Hello, world!"
document.body.appendChild(element)`,
      },
    },
  })

  let build = useDemoboardBuild(project.buildConfig)

  let instance = useDemoboardInstance({
    build,
    history: project.state.view.history,
    id: 'demoboard',
    pause: false,
    onChangeHistory: value => {
      project.dispatch({
        type: 'history.set',
        history: value,
      })
    },
  })

  return (
    <div>
      <h1>Demoboard: {instance.status}</h1>
      <h2>index.js</h2>
      <textarea
        style={{
          border: '1px inset #CCC',
          display: 'block',
          marginBottom: '16px',
          width: 600,
          height: 100,
        }}
        value={project.sources['/index.js']}
        onChange={event => {
          project.dispatch({
            type: 'sources.merge',
            files: {
              '/index.js': {
                source: event.target.value,
              },
            },
          })
        }}
      />
      <h2>index.html</h2>
      <textarea
        style={{
          border: '1px inset #CCC',
          display: 'block',
          marginBottom: '16px',
          width: 600,
          height: 100,
        }}
        value={project.sources['/index.html'].toString()}
        onChange={event => {
          project.dispatch({
            type: 'sources.merge',
            files: {
              '/index.html': {
                source: event.target.value,
              },
            },
          })
        }}
      />
      <h2>Output</h2>
      <DemoboardInstanceIFrame
        instance={instance}
        style={{
          border: '1px inset #CCC',
          display: 'block',
          marginBottom: '16px',
          width: 600,
          height: 100,
        }}
      />
    </div>
  )
}

export default App
