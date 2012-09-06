var Twilio  = require('../lib/twilio.js');
var mock    = require('./helpers/mock.js');

Twilio.AccountSid = mock.AccountSid = "SIDneyPoiter";
Twilio.AuthToken  = mock.AuthToken  = "secret";

describe('Twilio.Conference', function() {
  var api;

  describe('.find', function() {
    var api;

    it('can use twilio connect', function(done) {
      api = mock({
        accountSid: 'subaccount',
        connect:    true,
        resource:   'Conferences/CF90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'conference'
      });

      Twilio.Conference.find('CF90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   'Conferences/CF90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'conference'
      });

      Twilio.Conference.find('CF90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });


    it('returns an object representation of the API response', function(done) {
      api = mock({
        resource:   'Conferences/CF90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'conference'
      });

      Twilio.Conference.find('CF90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        expect(err).toEqual(null);
        for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
        api.done();
        done()
      });
    })
  });

  describe('.all', function() {
    var api;

    it('can use twilio connect', function(done) {
      api = mock({
        accountSid: 'subaccount',
        connect:    true,
        resource:   'Conferences',
        method:     'get',
        fixture:    'list_conferences'
      });

      Twilio.Conference.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   'Conferences',
        method:     'get',
        fixture:    'list_conferences'
      });

      Twilio.Conference.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });

    it('accepts filter paramters for a more specific query', function(done) {
      api = mock({
        resource:   'Conferences',
        method:     'get',
        fixture:    'list_conferences',
        body:       { From: '+12125551234' }
      });

      Twilio.Conference.all(function(err, res) {
        api.done();
        done()
      }, { from: '+12125551234' });
    });

    it('returns informations about how many resources there are including an array of resource instances', function(done) {
      api = mock({
        resource:   'Conferences',
        method:     'get',
        fixture:    'list_conferences'
      });

      Twilio.Conference.all(function(err, res) {
        expect(err).toEqual(null);
        for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
        api.done();
        done()
      });
    })
  });
    describe('accessing subresources', function() {
    it('can access subresources using a function with a name corresponding to the subresource name', function(done) {
      api = mock({
        resource:   'Conferences/CF90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'conference'
      });

      Twilio.Conference.find('CF90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        mock({
          chainTo:    api,
          uri:        res.subresourceUris[Object.keys(res.subresourceUris)[0]],
          method:     'get',
          fixture:    'list_' + Object.keys(res.subresourceUris)[0]
        });

        res[Object.keys(res.subresourceUris)[0]](function(err, res) {
          api.done();
          done();
        });
      });
    });
  });
});

