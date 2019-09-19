export interface SerializedPromise {
  outcomeType?: 'fulfilled' | 'rejected',
  outcome?: any,
}

let promiseOutcomes = new WeakMap<Promise<any>, SerializedPromise>()
let pendingPromises = new Set<Promise<any>>()
let outcomeStoredPromises = [] as Promise<any>[]

function setOutcome(promise: Promise<any>, type: 'fulfilled' | 'rejected', value: any) {
  pendingPromises.delete(promise)
  promiseOutcomes.set(promise, {
    outcomeType: type,
    outcome: value
  })
}

/**
 * Serialize a Map into JSON
 */
export default {
  type: 'Promise',

  // After doing an encode, the encoder should listen for outcomes on all of
  // these promises, and perform a re-encode once they settle.
  outcomeStoredPromises: outcomeStoredPromises,

  shouldTransform(type: any, obj: any) {
    return obj && obj instanceof Promise
  },
  toSerializable(promise: Promise<any>): SerializedPromise {
    let outcome = promiseOutcomes.get(promise)
    if (outcome) {
      return outcome
    }
    if (!pendingPromises.has(promise)) {
      pendingPromises.add(promise)
      outcomeStoredPromises.push(
        promise.then(
          setOutcome.bind(null, promise, 'fulfilled'),
          setOutcome.bind(null, promise, 'rejected'),
        )
      )
    }
  },
  fromSerializable(data: SerializedPromise) {
    // TODO: give promises ids, and use them to deserilize to a promise
    // that resolves if a future promise is deserialized with the same
    // id and an outcome.
    return Object.assign({ type: '[[Promise]]' }, data)
  }
}
