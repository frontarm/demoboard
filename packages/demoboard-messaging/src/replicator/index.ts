import Replicator from 'replicator'

import arithmeticTransform from './arithmeticTransform'
import functionTransform from './functionTransform'
import htmlTransform from './htmlTransform'
import mapTransform from './mapTransform'
import promiseTransform from './promiseTransform'

const transforms = [
  htmlTransform,
  functionTransform,
  arithmeticTransform,
  mapTransform,
]

let replicator
function getReplicator() {
  if (!replicator) {
    replicator = new Replicator()
    replicator.addTransforms(transforms)
  }
  return replicator
}
export function encode(value: any): string {
  return getReplicator().encode(value)
}

/**
 * This function finds promises as it encodes the json, and adds them to the
 * promise transform's `outcomeStoredPromises` property. If you run the
 * encode again after any of these promises change, it'll output a value with
 * the promise's result.
 *
 * It's ugly... but it allows promise results to be shown in the console.
 */
let replicatorWithPromises
function getReplicatorWithPromises() {
  if (!replicatorWithPromises) {
    replicatorWithPromises = new Replicator()
    replicatorWithPromises.addTransforms(
      (transforms as any).concat(promiseTransform),
    )
  }
  return replicatorWithPromises
}

export interface EncodedValueWithPromises {
  json: string
  promises: Promise<any>[]
}
export function encodeWithPromises(value: any): EncodedValueWithPromises {
  let json = getReplicatorWithPromises().encode(value)
  let promises = promiseTransform.outcomeStoredPromises.slice(0)
  promiseTransform.outcomeStoredPromises.length = 0
  return {
    json,
    promises,
  }
}

export function decode(value: any) {
  return getReplicatorWithPromises().decode(value)
}
