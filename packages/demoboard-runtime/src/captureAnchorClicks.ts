import { Host } from '@frontarm/demoboard-messaging'

/**
 * Capture clicks on anchors and send "navigate"
 */
export function captureAnchorClicks(host: Host) {
  function bubbleAnchorClick(e) {
    if (!e.defaultPrevented) {
      var target = e.target
      while (target && !(target instanceof HTMLAnchorElement)) {
        target = target.parentNode
      }
      var url = target.getAttribute('href')
      if (!/^mailto:/.test(url) && !target.target) {
        e.preventDefault()
        host.dispatch('navigate', { url })
      }
    }
  }

  function captureWindowClick(e) {
    var target = e.target

    do {
      if (target instanceof HTMLAnchorElement) {
        window.addEventListener('click', bubbleAnchorClick, false)
        setTimeout(function() {
          window.removeEventListener('click', bubbleAnchorClick, false)
        })
      }
    } while ((target = target.parentNode) != null)
  }

  window.addEventListener('click', captureWindowClick, true)
}
