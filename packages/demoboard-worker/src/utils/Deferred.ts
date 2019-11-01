/*
 * Copyright 2005-2019 Mozilla and individual contributors.
 * https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred
 */

export default class Deferred<T = any> {
  /* A method to resolve the associated Promise with the value passed.
   * If the promise is already settled it does nothing.
   *
   * @param {anything} value : This value is used to resolve the promise
   * If the value is a Promise then the associated promise assumes the state
   * of Promise passed as value.
   */
  resolve: (value: T) => void = undefined as any

  /* A method to reject the assocaited Promise with the value passed.
   * If the promise is already settled it does nothing.
   *
   * @param {anything} reason: The reason for the rejection of the Promise.
   * Generally its an Error object. If however a Promise is passed, then the Promise
   * itself will be the reason for rejection no matter the state of the Promise.
   */
  reject: (reason: any) => void = undefined as any

  /* A newly created Promise object.
   * Initially in pending state.
   */
  promise = new Promise<T>((resolve: any, reject: any) => {
    this.resolve = resolve
    this.reject = reject
  })
}
