import { Host } from '@frontarm/demoboard-messaging'

export function captureErrors(host: Host) {
  window.addEventListener('unhandledrejection', function(
    event: PromiseRejectionEvent,
  ) {
    let error =
      event.reason instanceof Error
        ? event.reason
        : new Error(event.reason || 'Unhandled Promise Rejection')

    host.dispatch('error', error)
  })

  window.addEventListener('error', function(event) {
    let error = event.error
    let message = event.message || ''
    if (message.toLowerCase().indexOf('script error') >= 0) {
      // I'm setting this message here instead of in the host application, as
      // the error won't reliably serialize as-is, so I'll need to create a
      // new error object anyway.
      error = new Error(
        "An error occured in an external script, but Demoboard couldn't access it due to your browser's cross-domain security policy.",
      )
      error.stack = null
    }
    host.dispatch('error', error)
  })
}
