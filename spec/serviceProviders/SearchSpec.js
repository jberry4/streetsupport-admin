/*
global describe, beforeEach, afterEach, it, expect
*/

'use strict'

const sinon = require('sinon')

const ajax = require('../../src/js/ajax')
const auth = require('../../src/js/auth')
const browser = require('../../src/js/browser')
const data = require('./serviceProviderData')

describe('Service Providers - search', () => {
  const Model = require('../../src/js/models/service-providers/listing')
  let sut,
    stubbedApi

  beforeEach(() => {
    const fakeResolved = {
      then: function (success, error) {
        success({
          'status': 200,
          'data': {
            items: data,
            total: 123
          }
        })
      }
    }

    stubbedApi = sinon.stub(ajax, 'get')
    stubbedApi.returns(fakeResolved)
    sinon.stub(auth, 'isCityAdmin').returns(false)
    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')

    sut = new Model()
  })

  afterEach(() => {
    ajax.get.restore()
    auth.isCityAdmin.restore()
    browser.loading.restore()
    browser.loaded.restore()
  })

  describe('- from start', () => {
    beforeEach(() => {
      sut.locationToFilterOn('manchester')
      sut.nameToFilterOn('street')
      sut.filterOnIsVerified(true)
      sut.filterOnIsPublished(true)

      sut.submitSearch()
    })

    it('- should request with expected filters', () => {
      var expected = {
        pageSize: '10',
        index: '0',
        name: 'street',
        isVerified: 'true',
        isPublished: 'true',
        location: 'manchester'
      }
      var actual = {}
      stubbedApi.secondCall.args[0]
        .split('?')[1]
        .split('&')
        .forEach((kv) => {
          const [key, value] = kv.split('=')
          actual[key] = value
        })
      expect(actual).toEqual(expected)
    })
  })

  describe('- after pagination', () => {
    beforeEach(() => {
      stubbedApi.reset() // calls count = 0

      sut.paginationLinks()[1].changePage() // call 1

      sut.locationToFilterOn('manchester')
      sut.nameToFilterOn('street')
      sut.filterOnIsVerified(true)
      sut.filterOnIsPublished(false)

      sut.submitSearch() // call 2
    })

    it('- should request with expected filters', () => {
      var expected = {
        pageSize: '10',
        index: '0',
        name: 'street',
        isVerified: 'true',
        isPublished: 'false',
        location: 'manchester'
      }
      var actual = {}
      stubbedApi.secondCall.args[0]
        .split('?')[1]
        .split('&')
        .forEach((kv) => {
          const [key, value] = kv.split('=')
          actual[key] = value
        })
      expect(actual).toEqual(expected)
    })
  })
})
