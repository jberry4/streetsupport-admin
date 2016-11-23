'use strict'

const adminUrls = require('../../admin-urls')
const ajax = require('../../ajax')
const browser = require('../../browser')
const cookies = require('../../cookies')
const endpoints = require('../../api-endpoints')
const htmlEncode = require('htmlencode')
const BaseViewModel = require('../../models/BaseViewModel')
const moment = require('moment')
const ko = require('knockout')

const Volunteer = function (data, listener) {
  let self = this
  self.id = data.id
  self.listener = listener
  self.person = {
    firstName: data.person.firstName,
    lastName: data.person.lastName,
    email: data.person.email,
    telephone: data.person.telephone,
    postcode: data.person.postcode,
    city: data.person.city
  }
  self.skillsAndExperience = {
    description: data.skillsAndExperience.description
  }
  self.availability = {
    description: data.availability.description
  }
  self.resources = {
    description: data.resources.description
  }

  self.contactUrl = adminUrls.contactVolunteer + '?id=' + data.id
  self.creationDate = moment(data.creationDate).format('DD/MM/YY')
  self.isHighlighted = ko.observable(false)
  self.highlighted = ko.computed(() => {
    return self.isHighlighted()
      ? 'volunteer volunteer--highlighted'
      : 'volunteer'
  }, self)

  self.contactHistory = ko.observableArray()
  self.hasContactHistory = ko.observable(false)
  self.hasRetrievedContactHistory = ko.observable(false)

  self.getContactHistory = () => {
    browser.loading()

    ajax
      .get(
        endpoints.volunteers + '/' + self.id + '/contact-requests',
        self.headers(cookies.get('session-token')),
        {})
      .then((result) => {
        let items = result.data.embedded.items
        items.forEach((i) => {
          i.message = htmlEncode.htmlDecode(i.message)
          i.createdDate = moment(i.createdDate).format('hh:mm DD/MM/YY')
        })
        self.contactHistory(result.data.embedded.items)
        self.hasContactHistory(result.data.embedded.items.length > 0)
        self.hasRetrievedContactHistory(true)
        browser.loaded()
      }, (_) => {
        browser.redirect(adminUrls.fiveHundred)
      })
  }

  self.archive = () => {
    browser.loading()

    ajax
      .patch(
        endpoints.volunteers + '/' + self.id + '/is-archived',
        self.headers(cookies.get('session-token')),
        {})
      .then((result) => {
        self.listener.archived(self.id)
        browser.loaded()
      })
  }
}

Volunteer.prototype = new BaseViewModel()

module.exports = Volunteer