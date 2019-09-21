export type SeriesOfTubesMessages = { [type: string]: any }

export interface SeriesOfTubesOptions<
  In extends SeriesOfTubesMessages,
  Out extends SeriesOfTubesMessages
> {
  id: string
  version?: number
  destination: Window
  inNamespace?: string
  outNamespace?: string
  encode?: {
    [OutType in keyof Out]?: (
      value: Out[OutType],
      tubes: SeriesOfTubes<In, Out>,
    ) => string
  }
  decode?: {
    [InType in keyof In]?: (
      encodedValue: string,
      tubes: SeriesOfTubes<In, Out>,
    ) => In[InType]
  }
}

export function createSeriesOfTubes<
  In extends SeriesOfTubesMessages,
  Out extends SeriesOfTubesMessages
>(options: SeriesOfTubesOptions<In, Out>): SeriesOfTubes<In, Out> {
  return new SeriesOfTubes(options)
}

export class SeriesOfTubes<
  In extends SeriesOfTubesMessages,
  Out extends SeriesOfTubesMessages
> {
  options: SeriesOfTubesOptions<In, Out>
  wildcardSubscriptions: Function[]
  typeSubscriptions: {
    [type: string]: Function[]
  }

  constructor(options: SeriesOfTubesOptions<In, Out>) {
    this.options = Object.assign(
      {
        inNamespace: '',
        outNamespace: '',
        encode: {},
        decode: {},
      },
      options,
    )
    this.typeSubscriptions = {}
    this.wildcardSubscriptions = []
    window.addEventListener('message', this.handleMessage, false)
  }

  subscribe(
    listener: (
      message: {
        [T in keyof In]: {
          type: T
          payload: In[T]
          id: string
          version?: number
        }
      }[keyof In],
    ) => void,
  ) {
    this.wildcardSubscriptions.push(listener)
    return () => {
      let index = this.wildcardSubscriptions.indexOf(listener)
      if (index !== -1) {
        this.wildcardSubscriptions.splice(index, 1)
      }
    }
  }

  subscribeTo<InType extends keyof In>(
    type: InType,
    listener: (data: In[InType]) => void,
  ) {
    let typeSubscriptions = this.typeSubscriptions[type as string]
    if (!typeSubscriptions) {
      typeSubscriptions = this.typeSubscriptions[type as string] = []
    }
    typeSubscriptions.push(listener)
    return () => {
      let index = typeSubscriptions.indexOf(listener)
      if (index !== -1) {
        typeSubscriptions.splice(index, 1)
      }
    }
  }

  dispatch<OutType extends keyof Out>(type: OutType, payload: Out[OutType]) {
    let encode = this.options.encode[type]
    let encodedPayload = encode ? encode(payload, this) : payload

    this.options.destination.postMessage(
      {
        type: this.options.outNamespace + type,
        payload: encodedPayload,
        id: this.options.id,
        version: this.options.version,
      },
      '*',
    )
  }

  dispose(): void {
    window.removeEventListener('message', this.handleMessage, false)
    delete this.wildcardSubscriptions
    delete this.typeSubscriptions
  }

  private handleMessage = (e: MessageEvent) => {
    let { id, inNamespace } = this.options
    let data = e.data
    if (
      !data ||
      !data.type ||
      data.type.indexOf(inNamespace) !== 0 ||
      data.id !== id
    ) {
      return
    }
    let type = data.type.replace(inNamespace, '')
    let typeSubscriptions = this.typeSubscriptions[type] || []

    // Need to get this before handling messages, as handling messages can
    // cause this object to be disposed.
    let wildcardSubscriptions = this.wildcardSubscriptions

    let decode = this.options.decode[type]
    let decodedPayload = decode ? decode(data.payload, this) : data.payload

    for (let i = 0; i < typeSubscriptions.length; i++) {
      typeSubscriptions[i](decodedPayload)
    }
    for (let i = 0; i < wildcardSubscriptions.length; i++) {
      wildcardSubscriptions[i]({
        type,
        payload: decodedPayload,
        version: data.version,
      })
    }
  }
}
