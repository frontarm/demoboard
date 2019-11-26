/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react'
import { BuildError } from './buildError'

export default {
  title: 'BuildError',
}

export const DefaultError = () => <BuildError error={new Error()} />

export const FetchFailedError = () => (
  <BuildError
    error={{
      isDemoboardBuildError: true,
      message: `The import "missingpackage" could not be fetched from "https://unpkg.com/missingpackage@latest/?meta"; the server returned "404" (in "/index.js").`,
      name: 'FetchFailedError',
      request: 'missingpackage',
      sourceFile: '/index.js',
      status: '404',
      url: 'https://unpkg.com/missingpackage@latest/?meta',
    }}
  />
)

export const FileNotFoundError = () => (
  <BuildError
    error={{
      isDemoboardBuildError: true,
      message: `The import "./typo" could not be found" (in "/README.mdx").`,
      name: 'FileNotFoundError',
      request: './typo',
      sourceFile: '/README.mdx',
    }}
  />
)

export const TransformError = () => (
  <BuildError
    error={{
      charNumber: '17',
      isDemoboardBuildError: true,
      lineNumber: '2',
      message: `unknown: Unterminated string constant (2:17)

  1 | import { Demoboard, DemoboardGlobalStyles } from '@frontarm/demoboard'
> 2 | import test from './test
    |                  ^`,
      name: 'TransformError',
      sourceFile: '/README.mdx',
    }}
  />
)
