/**
 * These errors don't extend `Error` as we don't need the stack trace, and 
 * extending `Error` prevents them from being passed out of the worker anyway.
 */

export class DemoboardBuildError {
  name: string
  message: string
  sourceFile: string

  isDemoboardBuildError = true

  constructor(name: string, sourceFile: string, message: string) {
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


export class FileNotFoundError extends DemoboardBuildError {
  request: string
  
  constructor(details: { request: string, sourceFile: string }) {
    super('FileNotFoundError', details.sourceFile, `The import "${details.request}" could not be found" (in "${details.sourceFile}").`)
    Object.assign(this, details)
  }
}

export class FetchFailedError extends DemoboardBuildError {
  request: string
  url: string
  status: string
  
  constructor(details: { request: string, url: string, status: string, sourceFile: string }) {
    super('FetchFailedError', details.sourceFile, `The import "${details.request}" could not be fetched from "${details.url}"; the server returned "${details.status}" (in "${details.sourceFile}").`)
    Object.assign(this, details)
  }
}

export class TransformError extends DemoboardBuildError {
  lineNumber?: number
  charNumber?: number

  constructor(details: { message: string, lineNumber?: number, charNumber?: number, sourceFile: string }) {
    super('TransformError', details.sourceFile, `The file "${details.sourceFile}" could not be compiled. `+details.message)
    Object.assign(this, details)
  }
}
