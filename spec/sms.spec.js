var Twilio  = require('../lib/twilio.js');
var mock    = require('./helpers/mock.js');

Twilio.AccountSid = mock.AccountSid = "SIDneyPoiter";
Twilio.AuthToken  = mock.AuthToken  = "secret";

describe('Twilio.SMS', function() {
  describe('.create', function() {

    describe('on successfully creating an SMS resource', function() {
      var api = mock({
        resource:   'SMS/Messages',
        method:     'post',
        fixture:    'sms_created',
        statusCode: 201,
        body: {"To":"+12125551234","From":"+16465550000","Body":"OMG! Awesome!"}
      });

      it('returns an object representation of the API response', function(done) {
        Twilio.SMS.create({"To":"+12125551234","From":"+16465550000","Body":"OMG! Awesome!"}, function(err, res) {
          expect(err).toEqual(null);
          for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
          api.done();
          done()
        });
      });
    });

    describe('on unsuccessfully creating an SMS resource', function() {
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
    var api = mock({
      resource:   'SMS/Messages/SM90c6fc909d8504d45ecdb3a3d5b3556e',
      method:     'get',
      fixture:    'sms_created'
    });

    it('returns an object representation of the API response', function(done) {
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

    beforeEach(function() {
      api = mock({
        resource:   'SMS/Messages',
        method:     'get',
        fixture:    'list_messages'
      });
    })

    it('returns informations about how many sms messages there are including an array of messages', function(done) {
      Twilio.SMS.all(function(err, res) {
        expect(err).toEqual(null);
        for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
        api.done();
        done()
      });
    })

    it('returns an array of ResourceInstances in sms_messages', function(done) {
      Twilio.SMS.all(function(err, res) {
        res.smsMessages.forEach(function(res, i) {
          for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response.smsMessages[i][prop]) }
        })
        api.done();
        done()
      });
    })
  });
});

