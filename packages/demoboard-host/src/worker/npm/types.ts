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
  browser?: string
  main?: string
  unpkg?: string
  meta: NPMDirectory
  version: string
}

export interface NPMResolution {
  name: string
  browserName: string
  version: string
  pathname: string
}
