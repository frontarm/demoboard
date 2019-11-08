import { Host } from '@frontarm/demoboard-messaging'

export interface NavigationLocation {
  href: string
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  username: string
  password: string
  origin: string
}

interface NavigationState {
  location: NavigationLocation
  length: number
  state: any
  onpopstate?: Function
}

export function createWindowWithStubbedNavigation(
  host: Host,
  window,
  initialLocation: NavigationLocation,
) {
  let navigationState: NavigationState = {
    location: Object.assign({}, initialLocation),
    length: 1,
    state: null,
  }

  function updateHistoryState(
    operation: 'pushState' | 'replaceState',
    state: any,
    title?: string | null,
    url?: string,
  ) {
    let parser = document.createElement('a')
    parser.href = url
    let newLocation = {
      href: parser.href,
      pathname: parser.pathname,
      search: parser.search,
      hash: parser.hash,
    }
    host.dispatch('update-history-state', {
      operation: operation,
      state: state,
      title: title,
      location: newLocation,
    })
    Object.assign(navigationState.location, newLocation)
    navigationState.state = state
    if (operation === 'pushState') {
      navigationState.length++
    }
  }

  let stubHistory = {
    get length() {
      return navigationState.length
    },
    get state() {
      return navigationState.state
    },
    pushState: (state: any, title?: string | null, url?: string) =>
      updateHistoryState('pushState', state, title, url),
    replaceState: (state: any, title?: string | null, url?: string) =>
      updateHistoryState('replaceState', state, title, url),
    go: n => {
      if (n === 0) {
        window.reload()
      }
      throw new Error('history.go() is not available')
    },
    back: () => {
      throw new Error('history.back() is not available')
    },
    forward: () => {
      throw new Error('history.forward() is not available')
    },
  }

  let stubLocation = {
    get pathname() {
      return navigationState.location.pathname || ''
    },
    set pathname(pathname) {
      if (pathname[0] !== '/') {
        pathname = '/' + pathname
      }

      host.dispatch('navigate', {
        url: pathname,
      })
    },
    get search() {
      return navigationState.location.search || ''
    },
    set search(search) {
      host.dispatch('navigate', {
        url: navigationState.location.pathname + (search || ''),
      })
    },
    get hash() {
      return navigationState.location.hash || ''
    },
    set hash(value) {
      window.location.hash = value
    },
    get state() {
      return navigationState.state
    },
    reload: () => {
      window.location.reload()
    },
  }

  let windowBoundFunctions = {}
  let windowProxy = new Proxy(window, {
    set: function(target, name, value) {
      if (name === 'location') {
        if (typeof value === 'string') {
          if (value.indexOf('//') === -1 && value[0] !== '/') {
            value = '/' + value
          }
          host.dispatch('navigate', {
            url: value,
          })
        } else if (value && value.pathname) {
          host.dispatch('navigate', {
            url: value.pathname,
          })
        } else {
          target[name] = value
        }
      } else if (name === 'onpopstate') {
        navigationState.onpopstate = value
      } else {
        target[name] = value
      }

      return true
    },
    get: function(target, name) {
      if (name === 'location') {
        return stubLocation
      }

      if (name === 'history') {
        return stubHistory
      }

      var result = target[name]
      if (name !== 'Promise' && typeof result === 'function') {
        var cached = windowBoundFunctions[name]
        if (cached) {
          return cached
        }
        windowBoundFunctions[name] = result.bind(window)
        return windowBoundFunctions[name]
      }
      return result
    },
    apply: function(target, thisArg, argumentsList) {
      target.apply(thisArg, argumentsList)
    },
  })

  host.subscribeTo('pop-state', payload => {
    let event = new PopStateEvent('popstate', { state: payload.state })
    Object.assign(navigationState.location, payload.location)
    navigationState.state = payload.state
    navigationState.length = payload.length
    if (navigationState.onpopstate) {
      navigationState.onpopstate(event)
    }
    if (event.defaultPrevented) {
      // TODO: push a message back to the host saying the operation was cancelled
      return
    }
    window.dispatchEvent(event)
    if (event.defaultPrevented) {
      // TODO: push a message back to the host saying the operation was cancelled
      return
    }
  })

  return windowProxy
}
