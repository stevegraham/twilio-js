var Twilio  = require('../lib/twilio.js');
var mock    = require('./helpers/mock.js');

Twilio.AccountSid = mock.AccountSid = "SIDneyPoiter";
Twilio.AuthToken  = mock.AuthToken  = "secret";

describe('Twilio.Queue', function() {
  var api;

  describe('.create', function() {

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'AC0000000000000000000000000000',
        resource:   'Queues',
        method:     'post',
        fixture:    'queue',
        statusCode: 201,
        body: {"FriendlyName":"bob","MaxSize":"Infinity"}
      });

      Twilio.Queue.create({"friendlyName":"bob","maxSize":"Infinity","accountSid":"AC0000000000000000000000000000"}, function(err, res) {
        api.done();
        done();
      });
    });

    describe('on successfully creating a Queues resource', function() {
      var api;

      it('returns an object representation of the API response', function(done) {
        api = mock({
          resource:   'Queues',
          method:     'post',
          fixture:    'queue',
          statusCode: 201,
          body: {"FriendlyName":"bob","MaxSize":"Infinity"}
        });

        Twilio.Queue.create({"friendlyName":"bob","maxSize":"Infinity"}, function(err, res) {
          expect(err).toEqual(null);
          for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
          api.done();
          done()
        });
      });
      describe('the object it returns', function() {
        describe('destroy()', function() {

          it('deletes the given resource', function(done) {
            api = mock({
              resource:   'Queues',
              method:     'post',
              fixture:    'call_created',
              statusCode: 201,
              body: {"FriendlyName":"bob","MaxSize":"Infinity"}
            });
            Twilio.Queue.create({"FriendlyName":"bob","MaxSize":"Infinity"}, function(err, res) {
              var instanceMock = mock({
                chainTo:    api,
                uri:        res.uri,
                method:     'delete',
                fixture:    'call_created',
                statusCode: 200,
                body: {"Url":"foo","Method":"foo","Status":"foo"}
              });

              res.destroy(function(err, res) {
                api.done();
                done()
              });
            });
          });
        });
      });

      describe('the object it returns', function() {
        it('has setters corresponding to the mutable properties of the resource the object represents, that update the resource when .save() is called.', function(done) {
          api = mock({
            resource:   'Queues',
            method:     'post',
            fixture:    'queue',
            statusCode: 201,
            body: {"FriendlyName":"bob","MaxSize":"Infinity"}
          });
          Twilio.Queue.create({"friendlyName":"bob","maxSize":"Infinity"}, function(err, res) {
            // Assert a POST is made to the resource URI with the given parameters
            var instanceMock = mock({
              chainTo:    api,
              uri:        res.uri,
              method:     'post',
              fixture:    'queue',
              statusCode: 200,
              body: {"FriendlyName":"foo","MaxSize":"foo"}
            });

            ["friendlyName", "maxSize"].forEach(function(el) { res[el] = 'foo' });
            res.save(function() {
              api.done();
              done();
            });
          });
        });
      });
    });

    describe('on unsuccessfully creating a Queues resource', function() {
      var api = mock({
        resource:   'Queues',
        method:     'post',
        fixture:    'api_error',
        statusCode: 422
      });

      it('should return an error object', function(done) {
        Twilio.Queue.create({}, function(err, res) {
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
        resource:   'Queues/QU90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'queue'
      });

      Twilio.Queue.find('QU90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   'Queues/QU90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'queue'
      });

      Twilio.Queue.find('QU90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });


    it('returns an object representation of the API response', function(done) {
      api = mock({
        resource:   'Queues/QU90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    'queue'
      });

      Twilio.Queue.find('QU90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
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
        resource:   'Queues',
        method:     'get',
        fixture:    'list_queues'
      });

      Twilio.Queue.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   'Queues',
        method:     'get',
        fixture:    'list_queues'
      });

      Twilio.Queue.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });

    it('accepts filter paramters for a more specific query', function(done) {
      api = mock({
        resource:   'Queues',
        method:     'get',
        fixture:    'list_queues',
        body:       { From: '+12125551234' }
      });

      Twilio.Queue.all(function(err, res) {
        api.done();
        done()
      }, { from: '+12125551234' });
    });

    it('returns informations about how many resources there are including an array of resource instances', function(done) {
      api = mock({
        resource:   'Queues',
        method:     'get',
        fixture:    'list_queues'
      });

      Twilio.Queue.all(function(err, res) {
        expect(err).toEqual(null);
        for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
        api.done();
        done()
      });
    })
  });
});

