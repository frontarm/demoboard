/*
 * Copyright 2019 Seven Stripes Kabushiki Kaisha
 *
 * This source code is licensed under the Apache License, Version 2.0, found
 * in the LICENSE file in the root directory of this source tree.
 */

export interface NPMDirectory {
  files: NPMFiles
  path: string
  type: 'directory'
}

export type NPMFiles = Map<string, NPMDirectory | NPMFile>

export interface NPMFile {
  contentType: string
  integrity: string
  lastModified: string
  path: string
  size: string
  type: 'file'
}

export interface NPMPackage {
  dependencies?: {
    [name: string]: string
  }
  name: string
  browser?: string
  main?: string
  unpkg?: string
  meta: NPMDirectory
  version: string
}

export type NPMResolution =
  | {
      status: 'resolved'
      url: string
      name: string
      browserName: string
      version: string
      pathname: string
    }
  | {
      status: 'notfound'
      url: string
    }
