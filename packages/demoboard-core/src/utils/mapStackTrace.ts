/**
 * Original work Copyright 2014 James Salter <iteration@gmail.com>
 * Licensed under the New BSD license. See:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on: sourcemapped-stacktrace.js
 * https://github.com/novocaine/sourcemapped-stacktrace
 *
 * Updated work Copyright 2019 Seven Stripes Kabushiki Kaisha
 */

import { SourceMapConsumer } from '../vendor/SourceMapConsumer'
import { DemoboardWorkerTransformedModule } from '../types'

if (
  typeof navigator !== 'undefined' &&
  !navigator.userAgent.includes('jsdom')
) {
  SourceMapConsumer.initialize({
    'lib/mappings.wasm': 'https://unpkg.com/source-map@0.7.3/lib/mappings.wasm',
  })
}

interface LineFormat {
  pattern: RegExp
  expectedFieldCount: number
  name?: number
  uri: number
  line: number
  column: number
}

interface StackItem {
  // An undefined name represents "(unknown)", while null indicates
  // top level code that doesn't have a name.
  name?: string | null
  uri: string
  line: number
  column: number
}

export async function mapStackTrace(
  stack: any,
  transformedModules: { [pathname: string]: DemoboardWorkerTransformedModule },
) {
  let rows = {} as { [name: string]: StackItem }
  let formats: LineFormat[]
  let skipLines: number

  if (isChromeOrEdge()) {
    formats = [
      {
        pattern: /^\s+at\s+(.+)\s+\((.*):([0-9]+):([0-9]+)/,
        expectedFieldCount: 5,
        name: 1,
        uri: 2,
        line: 3,
        column: 4,
      },
      {
        pattern: /^\s+at\s+(.*):([0-9]+):([0-9]+)/,
        expectedFieldCount: 4,
        uri: 1,
        line: 2,
        column: 3,
      },
    ]
    // (skip first line containing exception message)
    skipLines = 1
  } else if (isFirefox() || isSafari()) {
    formats = [
      {
        pattern: /@(.*):([0-9]+):([0-9]+)/,
        expectedFieldCount: 4,
        uri: 1,
        line: 2,
        column: 3,
      },
    ]
    skipLines = 0
  } else {
    // Unknown browser :-(
    return stack
  }

  let lines = stack.split('\n').slice(skipLines)

  // TODO: match lines that aren't within a function

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    let j = 0
    let format: LineFormat
    let fields = null
    do {
      format = formats[j++]
      fields = line.match(format.pattern)
    } while (!fields && j < formats.length)

    if (fields && fields.length === format.expectedFieldCount) {
      rows[i] = {
        name: format.name ? fields[format.name] : null,
        uri: fields[format.uri],
        line: parseInt(fields[format.line], 10),
        column: parseInt(fields[format.column], 10),
      }
    }
  }

  let result = []
  for (let i = 0; i < lines.length; i++) {
    let row = rows[i]

    if (row) {
      let { uri, line, column, name = null } = row

      // The URI for demoboard runtime code is set to this, so we can safely
      // skip it.
      if (uri === 'frontarm.com') {
        continue
      }

      let transpiledModule = transformedModules[uri]
      let map = transpiledModule && transpiledModule.map
      let consumer = map && (await new SourceMapConsumer(map))

      if (consumer) {
        // we think we have a map for that uri. call source-map library
        let origPos = consumer.originalPositionFor({
          line: line,
          column: column,
        })

        if (origPos.line) {
          result.push(
            formatOriginalPosition(
              origPos.source,
              origPos.line,
              origPos.column,
              origPos.name || name,
            ),
          )
        }
      } else {
        // we can't find a map for that url, but we parsed the row.
        // reformat unchanged line for consistency with the sourcemapped
        // lines.
        result.push(formatOriginalPosition(uri, line, column, name))
      }
    } else {
      // we weren't able to parse the row, push back what we were given
      result.push(lines[i])
    }
  }

  return result.join('\n')
}

function isChromeOrEdge() {
  return navigator.userAgent.toLowerCase().indexOf('chrome') > -1
}

function isFirefox() {
  return navigator.userAgent.toLowerCase().indexOf('firefox') > -1
}

function isSafari() {
  return navigator.userAgent.toLowerCase().indexOf('safari') > -1
}

function formatOriginalPosition(
  source: string | null,
  line: number,
  column: number | null,
  name: string | null,
) {
  // mimic chrome's format
  return (
    '    at ' +
    (name === null ? '' : name || '(unknown)') +
    (name !== null ? ' (' : '') +
    source +
    ':' +
    line +
    ':' +
    column +
    (name !== null ? ')' : '')
  )
}
