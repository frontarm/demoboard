export type ConsoleItemPayloads = {
  assert: any[],
  clear: null,
  count: any[]
  debug: any[],
  error: any[],
  info: any[],
  log: any[],
  table: {
    data: string,
    columns?: string[],
  },
  timeEnd: any[]
  warn: any[],
}

export type ConsoleMethod = keyof ConsoleItemPayloads

export type ConsoleItem = {
  [T in keyof ConsoleItemPayloads]: {
    method: T,
    id: string
    data: ConsoleItemPayloads[T]
  }
}[keyof ConsoleItemPayloads]
