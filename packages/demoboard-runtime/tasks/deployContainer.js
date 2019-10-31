const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')

const { version } = require('../package.json')

const s3 = new AWS.S3()
const filename = `container-${version}.html`

console.log('Uploading ' + filename + '...')

const containerPath = path.resolve(__dirname, '../dist/container.html')
const containerHTML = fs.readFileSync(containerPath, 'utf8')

const params = {
  ACL: 'public-read',
  Body: containerHTML,
  Bucket: 'demoboard.frontarm.com',
  ContentType: 'text/html',
  Key: filename,
}
s3.putObject(params, function(err, data) {
  if (err) {
    console.log('Error', err, err.stack)
    process.exit(1)
  } else {
    console.log('Uploaded!')
  }
})
