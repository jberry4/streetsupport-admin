var ajax = require('../../ajax')
var browser = require('../../browser')
var cookies = require('../../cookies')
var ko = require('knockout')
var BaseViewModel = require('../BaseViewModel')
var urlParams = require('../../get-url-parameter')

function ResetPasswordModel () {
  var self = this

  self.password = ko.observable('')
  self.password2 = ko.observable('')
  self.isSubmissionSuccessful = ko.observable(false)
  self.isSubmitting = false

  self.submit = function () {
    var self = this
    if (!self.isSubmitting) {
      if (self.password() === self.password2()) {
        browser.loading()
        self.isSubmitting = true
        self.message('Loading, please wait')
        ajax.put(
          self.endpointBuilder.resetPassword(urlParams.parameter('id')).build(),
          self.headers(cookies.get('session-token')),
          {
            'Password': self.password()
          })
        .then(function (result) {
          self.isSubmissionSuccessful(true)
          browser.loaded()
        }, function (error) {
          self.handleError(error)
          self.isSubmitting = false
        })
      } else {
        self.errors(['Passwords must match.'])
      }
    }
  }
}

ResetPasswordModel.prototype = new BaseViewModel()

module.exports = ResetPasswordModel
