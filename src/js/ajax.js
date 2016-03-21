var Q = require('q')

var post = function (url, data) {
  var deferred = Q.defer()
  var req = new XMLHttpRequest()
  req.open('POST', url, true)
  req.setRequestHeader('content-type', 'application/json')

  req.onload = function () {
    if (this.status === 201) {
      deferred.resolve({
        'status': 'created',
        'statusCode': this.status,
        'json': JSON.parse(this.responseText)
      })
    } else if (this.status === 200) {
      deferred.resolve({
        'status': 'ok',
        'statusCode': this.status,
        'json': JSON.parse(this.responseText)
      })
    } else {
      deferred.resolve({
        'status': 'error',
        'statusCode': this.status,
        'messages': JSON.parse(this.responseText).messages
      })
    }
  }

  req.onerror = function () {
    deferred.reject(new Error('Server responded with a status of ' + req.status))
  }

  req.send(JSON.stringify(data))

  return deferred.promise
}

module.exports = {
  post: post,
  postJson: post // deprecated
}
