/*
global describe, beforeEach, afterEach, it, expect
*/

'use strict'

const sinon = require('sinon')

const adminurls = require('../../src/js/admin-urls')
const ajax = require('../../src/js/ajax')
const auth = require('../../src/js/auth')
const browser = require('../../src/js/browser')
const data = require('./serviceProviderData')
const endpoints = require('../../src/js/api-endpoints')

import { cities as locations } from '../../src/data/generated/supported-cities'

describe('Service Providers', () => {
  const Model = require('../../src/js/models/service-providers/listing')
  let sut
  let stubbedApi
  let browserLoadingStub
  let browserLoadedStub

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

    stubbedApi = sinon.stub(ajax, 'get').returns(fakeResolved)
    sinon.stub(auth, 'isCityAdmin').returns(false)
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')

    sut = new Model()
  })

  afterEach(() => {
    ajax.get.restore()
    auth.isCityAdmin.restore()
    browser.loading.restore()
    browser.loaded.restore()
  })

  it('should tell user loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
  })

  it('should retrieve service providers from api', () => {
    var endpoint = `${endpoints.getServiceProvidersv3}?pageSize=10&index=0`
    var payload = {}
    var apiCalledWithExpectedArgs = stubbedApi.withArgs(endpoint, payload).calledOnce
    expect(apiCalledWithExpectedArgs).toBeTruthy()
  })

  it('should tell user loaded', () => {
    expect(browserLoadedStub.calledAfter(stubbedApi)).toBeTruthy()
  })

  it('should populate service provider collection', () => {
    expect(sut.serviceProviders().length).toEqual(3)
  })

  it('should sort service provider by name', () => {
    expect(sut.serviceProviders()[0].key).toEqual('albert-kennedy-trust')
    expect(sut.serviceProviders()[1].key).toEqual('booth-centre')
    expect(sut.serviceProviders()[2].key).toEqual('coffee4craig')
  })

  it('should set service provider url', () => {
    expect(sut.serviceProviders()[0].url).toEqual(adminurls.serviceProviders + '?key=albert-kennedy-trust')
  })

  it('should set create new user url', () => {
    expect(sut.serviceProviders()[0].newUserUrl).toEqual(adminurls.userAdd + '?key=albert-kennedy-trust')
  })

  it('should have verifiedLabel equal to the providers verification status', () => {
    expect(sut.serviceProviders()[0].verifiedLabel()).toEqual('under review')
    expect(sut.serviceProviders()[1].verifiedLabel()).toEqual('verified')
  })

  it('should have verifiedLabelClass based on the providers verification status', () => {
    expect(sut.serviceProviders()[0].verifiedLabelClass()).toEqual('status status--false')
    expect(sut.serviceProviders()[1].verifiedLabelClass()).toEqual('status status--true')
  })

  it('should have publishedLabel equal to the providers publication status', () => {
    expect(sut.serviceProviders()[0].publishedLabel()).toEqual('disabled')
    expect(sut.serviceProviders()[1].publishedLabel()).toEqual('published')
  })

  it('should have publishedLabelClass based on the providers publication status', () => {
    expect(sut.serviceProviders()[0].publishedLabelClass()).toEqual('status status--false')
    expect(sut.serviceProviders()[1].publishedLabelClass()).toEqual('status status--true')
  })

  it('- should set available locations', () => {
    expect(sut.availableLocations().length).toEqual(locations.length)
  })

  it('- should construct pagination', () => {
    expect(sut.paginationLinks().length).toEqual(13)
  })

  describe('- pagination', () => {
    beforeEach(() => {
      sut.paginationLinks()[2].changePage() // page 3
    })

    it('- should retrieve new page', () => {
      var endpoint = `${endpoints.getServiceProvidersv3}?pageSize=10&index=20`
      var payload = {}
      var apiCalledWithExpectedArgs = stubbedApi.withArgs(endpoint, payload).calledOnce
      expect(apiCalledWithExpectedArgs).toBeTruthy()
    })
  })
})
