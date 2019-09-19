// Don't create a worker on JSDOM builds
let worker
if (typeof Worker !== 'undefined') {
  worker = require('workerize-proxy-loader!./worker')()
}

export default worker
