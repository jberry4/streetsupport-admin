var FastClick = require('fastclick')
var nav = require('./../nav.js')

nav.init()
FastClick.attach(document.body)

require.ensure(['knockout', '../models/volunteers/ContactVolunteerModel'], function (require) {
  var ko = require('knockout')
  var Model = require('../models/volunteers/ContactVolunteerModel')
  ko.applyBindings(new Model())
})
