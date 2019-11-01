/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

/**
 * These errors don't extend `Error` as we don't need the stack trace, and
 * extending `Error` prevents them from being passed out of the worker anyway.
 */
export class DemoboardBuildError {
  name: string
  message: string
  sourceFile: string | null

  isDemoboardBuildError = true

  constructor(name: string, sourceFile: string | null, message: string) {
    // Not using this as the minifier breaks it
    // this.name = new.target.name
    this.name = name

    this.message = message
    this.sourceFile = sourceFile
  }

  toString() {
    return `${this.name}: ${this.message}`
  }
}

export class DemoboardFileNotFoundError extends DemoboardBuildError {
  request: string

  constructor(details: { request: string; sourceFile: string }) {
    super(
      'FileNotFoundError',
      details.sourceFile,
      `The import "${details.request}" could not be found" (in "${
        details.sourceFile
      }").`,
    )
    Object.assign(this, details)
  }
}

export class DemoboardFetchFailedError extends DemoboardBuildError {
  request?: string
  url: string
  status: number

  constructor(details: {
    request?: string
    url: string
    status: string
    sourceFile: string
  }) {
    super(
      'FetchFailedError',
      details.sourceFile,
      `The import "${details.request}" could not be fetched from "${
        details.url
      }"; the server returned "${details.status}" (in "${
        details.sourceFile
      }").`,
    )
    Object.assign(this, details)
  }
}

export class DemoboardTransformError extends DemoboardBuildError {
  lineNumber?: number
  charNumber?: number

  constructor(details: {
    message: string
    lineNumber?: number
    charNumber?: number
    sourceFile: string
  }) {
    super(
      'TransformError',
      details.sourceFile,
      `The file "${details.sourceFile}" could not be compiled. ` +
        details.message,
    )
    Object.assign(this, details)
  }
}
