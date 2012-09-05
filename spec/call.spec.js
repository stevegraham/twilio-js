var Twilio  = require('../lib/twilio.js');
var mock    = require('./helpers/mock.js');

Twilio.AccountSid = mock.AccountSid = "SIDneyPoiter";
Twilio.AuthToken  = mock.AuthToken  = "secret";

describe('Twilio.Call', function() {
  var api;

  describe('.create', function() {

    it('can use twilio connect', function(done) {
      api = mock({
        accountSid: 'AC0000000000000000000000000000',
        connect:    true,
        resource:   'Calls',
        method:     'post',
        fixture:    'connect_call_created',
        statusCode: 201,
        body: {"To":"+12125551234","From":"+16465550000","Url":"http://example.com/voice.twiml"}
      });

      Twilio.Call.create({"to":"+12125551234","from":"+16465550000","url":"http://example.com/voice.twiml", accountSid: 'AC0000000000000000000000000000', connect: true }, function(err, res) {
        var instanceMock = mock({
          chainTo:    api,
          accountSid: res.accountSid,
          connect:    true,
          uri:        res.uri,
          method:     'post',
          fixture:    'connect_call_created',
          statusCode: 200,
          body: {"Url":"foo","Method":"foo","Status":"foo"}
        });

        // twilio connect uses a different accountSID for auth. We want to ensure we
        // use the correct sid for updating resources
        ["url", "method", "status"].forEach(function(el) { res[el] = 'foo' });

        res.save(function(err, res) {
          api.done();
          done();
        });
      });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   'Calls',
        method:     'post',
        fixture:    'call_created',
        statusCode: 201,
        body: {"To":"+12125551234","From":"+16465550000","Url":"http://example.com/voice.twiml"}
      });

      Twilio.Call.create({"to":"+12125551234","from":"+16465550000","url":"http://example.com/voice.twiml", accountSid: 'subaccount' }, function(err, res) {
        api.done();
        done();
      });
    });

    describe('on successfully creating an SMS resource', function() {
      var api;

      beforeEach(function() {
        api = mock({
          resource:   'Calls',
          method:     'post',
          fixture:    'call_created',
          statusCode: 201,
          body: {"To":"+12125551234","From":"+16465550000","Url":"http://example.com/voice.twiml"}
        });
      });

      it('returns an object representation of the API response', function(done) {
        Twilio.Call.create({"to":"+12125551234","from":"+16465550000","url":"http://example.com/voice.twiml"}, function(err, res) {
          expect(err).toEqual(null);
          for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
          api.done();
          done()
        });
      });

      describe('the object it returns', function() {

        //describe('destroy()');

        it('has setters corresponding to the mutable properties of the resource the object represents, that update the resource when .save() is called.', function(done) {
          Twilio.Call.create({"to":"+12125551234","from":"+16465550000","url":"http://example.com/voice.twiml"}, function(err, res) {
            // Assert a POST is made to the resource URI with the given parameters
            var instanceMock = mock({
              chainTo:    api,
              uri:        res.uri,
              method:     'post',
              fixture:    'call_created',
              statusCode: 200,
              body: {"Url":"foo","Method":"foo","Status":"foo"}
            });

            ["url", "method", "status"].forEach(function(el) { res[el] = 'foo' });

            res.save(function(err, res) {
              api.done();
              instanceMock.done();
              done();
            });
          });
        });
      });
    });

    describe('on unsuccessfully creating an SMS resource', function() {
      var api = mock({
        resource:   'Calls',
        method:     'post',
        fixture:    'api_error',
        statusCode: 422
      });

      it('should return an error object', function(done) {
        Twilio.Call.create({}, function(err, res) {
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
        resource:   'Calls/CA90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'call_created'
      });

      Twilio.Call.find('CA90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   'Calls/CA90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'call_created'
      });

      Twilio.Call.find('CA90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });

    it('returns an object representation of the API response', function(done) {
      api = mock({
        resource:   'Calls/CA90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'call_created'
      });

      Twilio.Call.find('CA90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        expect(err).toEqual(null);
        for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
        api.done();
        done();
      });
    });
  });

  describe('.all', function() {
    var api;

    it('can use twilio connect', function(done) {
      api = mock({
        accountSid: 'subaccount',
        connect:    true,
        resource:   'Calls',
        method:     'get',
        fixture:    'list_calls',
      });

      Twilio.Call.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   'Calls',
        method:     'get',
        fixture:    'list_calls',
      });

      Twilio.Call.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });

    it('accepts filter paramters for a more specific query', function(done) {
      api = mock({
        resource:   'Calls',
        method:     'get',
        fixture:    'list_calls',
        body:       { From: '+12125551234' }
      });

      Twilio.Call.all(function(err, res) {
        api.done();
        done()
      }, { from: '+12125551234' });
    });

    it('returns informations about how many sms messages there are including an array of messages', function(done) {
      api = mock({
        resource:   'Calls',
        method:     'get',
        fixture:    'list_calls'
      });

      Twilio.Call.all(function(err, res) {
        expect(err).toEqual(null);
        for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
        api.done();
        done()
      });
    });
  });

  describe('accessing subresources', function() {
    it('can access subresources using a function with a name corresponding to the subresource name', function(done) {
      api = mock({
        resource:   'Calls/CA90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'call_created'
      });

      Twilio.Call.find('CA90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        mock({
          chainTo:    api,
          uri:        res.subresourceUris['notifications'],
          method:     'get',
          fixture:    'list_notifications'
        });

        res.notifications(function(err, res) {
          api.done();
          done();
        });
      });
    });
  });
});




