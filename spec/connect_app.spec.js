var Twilio  = require('../lib/twilio.js');
var mock    = require('./helpers/mock.js');

Twilio.AccountSid = mock.AccountSid = "SIDneyPoiter";
Twilio.AuthToken  = mock.AuthToken  = "secret";

describe('Twilio.ConnectApp', function() {
  var api;

  describe('.find', function() {
    var api;

    it('can use twilio connect', function(done) {
      api = mock({
        accountSid: 'subaccount',
        connect:    true,
        resource:   'ConnectApps/CN90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'connect_app'
      });

      Twilio.ConnectApp.find('CN90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   'ConnectApps/CN90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'connect_app'
      });

      Twilio.ConnectApp.find('CN90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });


    it('returns an object representation of the API response', function(done) {
      api = mock({
        resource:   'ConnectApps/CN90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'connect_app'
      });

      Twilio.ConnectApp.find('CN90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
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
        resource:   'ConnectApps',
        method:     'get',
        fixture:    'list_connect_apps'
      });

      Twilio.ConnectApp.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   'ConnectApps',
        method:     'get',
        fixture:    'list_connect_apps'
      });

      Twilio.ConnectApp.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });

    it('accepts filter paramters for a more specific query', function(done) {
      api = mock({
        resource:   'ConnectApps',
        method:     'get',
        fixture:    'list_connect_apps',
        body:       { From: '+12125551234' }
      });

      Twilio.ConnectApp.all(function(err, res) {
        api.done();
        done()
      }, { from: '+12125551234' });
    });

    it('returns informations about how many resources there are including an array of resource instances', function(done) {
      api = mock({
        resource:   'ConnectApps',
        method:     'get',
        fixture:    'list_connect_apps'
      });

      Twilio.ConnectApp.all(function(err, res) {
        expect(err).toEqual(null);
        for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
        api.done();
        done()
      });
    })
  });
});

