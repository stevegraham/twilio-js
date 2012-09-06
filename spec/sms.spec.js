var Twilio  = require('../lib/twilio.js');
var mock    = require('./helpers/mock.js');

Twilio.AccountSid = mock.AccountSid = "SIDneyPoiter";
Twilio.AuthToken  = mock.AuthToken  = "secret";

describe('Twilio.SMS', function() {
  var api;

  describe('.create', function() {

    it('can use twilio connect', function(done) {
      api = mock({
        accountSid: 'AC0000000000000000000000000000',
        connect:    true,
        resource:   'SMS/Messages',
        method:     'post',
        fixture:    'connect_sms_created',
        statusCode: 201,
        body: {"To":"+12125551234","From":"+16465550000","Body":"OMG! Awesome!"}
      });

      Twilio.SMS.create({"to":"+12125551234","from":"+16465550000","body":"OMG! Awesome!","accountSid":"AC0000000000000000000000000000","connect":true}, function(err, res) {
        var instanceMock = mock({
          chainTo:    api,
          accountSid: res.accountSid,
          connect:    true,
          uri:        res.uri,
          method:     'post',
          fixture:    'connect_sms_created',
          statusCode: 200,
          body: {}
        });

        // twilio connect uses a different accountSID for auth. We want to ensure we
        // use the correct sid for updating resources
        [].forEach(function(el) { res[el] = 'foo' });

        res.save(function(err, res) {
          api.done();
          done();
        });
      });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'AC0000000000000000000000000000',
        resource:   'SMS/Messages',
        method:     'post',
        fixture:    'sms_created',
        statusCode: 201,
        body: {"To":"+12125551234","From":"+16465550000","Body":"OMG! Awesome!"}
      });

      Twilio.SMS.create({"to":"+12125551234","from":"+16465550000","body":"OMG! Awesome!","accountSid":"AC0000000000000000000000000000"}, function(err, res) {
        api.done();
        done();
      });
    });

    describe('on successfully creating a SMS/Messages resource', function() {
      var api;

      it('returns an object representation of the API response', function(done) {
        api = mock({
          resource:   'SMS/Messages',
          method:     'post',
          fixture:    'sms_created',
          statusCode: 201,
          body: {"To":"+12125551234","From":"+16465550000","Body":"OMG! Awesome!"}
        });

        Twilio.SMS.create({"to":"+12125551234","from":"+16465550000","body":"OMG! Awesome!"}, function(err, res) {
          expect(err).toEqual(null);
          for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
          api.done();
          done()
        });
      });
    });

    describe('on unsuccessfully creating a SMS/Messages resource', function() {
      var api = mock({
        resource:   'SMS/Messages',
        method:     'post',
        fixture:    'api_error',
        statusCode: 422
      });

      it('should return an error object', function(done) {
        Twilio.SMS.create({}, function(err, res) {
          expect(err).toEqual(new Error(api.response.message));
          expect(res).toEqual(null);
          api.done();
          done()
        });
      });
    });
  });
  describe('.find', function() {
    var api;

    it('can use twilio connect', function(done) {
      api = mock({
        accountSid: 'subaccount',
        connect:    true,
        resource:   'SMS/Messages/SM90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'sms_created'
      });

      Twilio.SMS.find('SM90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   'SMS/Messages/SM90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'sms_created'
      });

      Twilio.SMS.find('SM90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });


    it('returns an object representation of the API response', function(done) {
      api = mock({
        resource:   'SMS/Messages/SM90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'sms_created'
      });

      Twilio.SMS.find('SM90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
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
        resource:   'SMS/Messages',
        method:     'get',
        fixture:    'list_messages'
      });

      Twilio.SMS.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   'SMS/Messages',
        method:     'get',
        fixture:    'list_messages'
      });

      Twilio.SMS.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });

    it('accepts filter paramters for a more specific query', function(done) {
      api = mock({
        resource:   'SMS/Messages',
        method:     'get',
        fixture:    'list_messages',
        body:       { From: '+12125551234' }
      });

      Twilio.SMS.all(function(err, res) {
        api.done();
        done()
      }, { from: '+12125551234' });
    });

    it('returns informations about how many resources there are including an array of resource instances', function(done) {
      api = mock({
        resource:   'SMS/Messages',
        method:     'get',
        fixture:    'list_messages'
      });

      Twilio.SMS.all(function(err, res) {
        expect(err).toEqual(null);
        for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
        api.done();
        done()
      });
    })
  });
});

