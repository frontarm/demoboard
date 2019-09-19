import {
  Host,
  ConsoleMethod,
  ConsoleItemPayloads,
} from '@frontarm/demoboard-messaging'

export const forwardedMethods: (keyof Console)[] = [
  'assert',
  'clear',
  'count',
  'debug',
  'error',
  'info',
  'log',
  'table',
  'time',
  'timeEnd',
  'warn',
]

export function captureConsole(targetConsole: Console, host: Host) {
  let nativeConsole = {}
  let forwardedConsole = new ForwardedConsole({
    host,
  })

  for (let i = 0; i < forwardedMethods.length; i++) {
    let method = forwardedMethods[i]
    let nativeMethod = targetConsole[method]

    nativeConsole[method] = nativeMethod

    targetConsole[method] = (...args) => {
      nativeMethod.apply(this, args)
      forwardedConsole[method].apply(forwardedConsole, args)
    }
  }

  targetConsole['native'] = nativeConsole
}

export interface ForwardedConsoleOptions {
  host: Host
  idPrefix?: string
}

export class ForwardedConsole {
  host: Host
  idPrefix: string
  nextId: number

  counts: {
    [label: string]: number
  }
  timingStarts: {
    [label: string]: number
  }

  constructor(options: ForwardedConsoleOptions) {
    this.host = options.host
    this.idPrefix =
      options.idPrefix ||
      Math.random()
        .toString(36)
        .slice(2)
    this.nextId = 1
  }

  assert(expression: any, ...args: any[]) {
    if (expression) {
      return false
    }

    if (args.length === 0) {
      args.push('console.assert')
    }

    this.forwardItem('assert', args)
  }

  clear() {
    this.forwardItem('clear', null)
  }

  count(label = 'default') {
    if (!label) {
      return false
    }

    let times = this.counts[label] || 0
    this.counts[label] = times + 1

    this.forwardItem('count', [`${label}: ${times}`])
  }

  debug(...args: any[]) {
    this.forwardItem('debug', args)
  }

  error(...args: any[]) {
    this.forwardItem('error', args)
  }

  info(...args: any[]) {
    this.forwardItem('info', args)
  }

  log(...args: any[]) {
    this.forwardItem('log', args)
  }

  table(data: any, columns?: string[]) {
    this.forwardItem('table', {
      data,
      columns,
    })
  }

  time(label = 'default') {
    this.timingStarts[label] = performance.now() || Date.now()
  }

  timeEnd(label = 'default') {
    if (!label) {
      return
    }

    let start = this.timingStarts[label]
    let end = performance.now() || Date.now()

    delete this.timingStarts[label]

    if (start) {
      this.forwardItem('timeEnd', [`${label}: ${end - start}ms`])
    } else {
      this.forwardItem('warn', [`Timer '${label}' does not exist`])
    }
  }

  warn(...args: any[]) {
    this.forwardItem('warn', args)
  }

  private forwardItem<M extends ConsoleMethod>(
    method: M,
    data: ConsoleItemPayloads[M],
  ) {
    this.host.dispatch('console-item', {
      method: method as any,
      id: this.idPrefix + '/' + String(this.nextId++),
      data: data as any,
    })
  }
}
