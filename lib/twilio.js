module.exports = (function() {
  var request      = require('request');
  var util         = require('util');
  var API_ENDPOINT = 'api.twilio.com';
  var API_VERSION  = '2010-04-01';

  var uriFor = function(resource) {
    return util.format('https://%s:%s@%s/%s/Accounts/%s/%s.json', Twilio.AccountSid, Twilio.AuthToken, API_ENDPOINT, API_VERSION, Twilio.AccountSid, resource)
  }

  var upcaseKeys = function(obj) {
    for (var key in obj) {
      var temp;
      if (obj.hasOwnProperty(key)) {
        temp = obj[key];
        delete obj[key];
        obj[key.charAt(0).toUpperCase() + key.substring(1)] = temp;
      }
    }
    return obj
  }


  var callbackFactory = function(fn) {
    return function(e, r, body) {
      // Return if no callback function given. User doesn't care about response.
      if(!fn) return;
      // If a 2xx response, pass in response to callback
      body = JSON.parse(body);
      if(!e && Math.floor(r.statusCode / 100) == 2) {
        fn(null, body);
      } else {
      // else pass in an error object
        fn(new Error(body.message), null);
      }
    }
  }

  var Twilio = {
    SMS: {
      create: function(params, fn) {
        request.post({ uri: uriFor('SMS/Messages'), form: upcaseKeys(params), headers: { 'Accept' : 'application/json' } }, callbackFactory(fn));
      },

      all: function(fn) {
        request.get({ uri: uriFor('SMS/Messages'), headers: { 'Accept' : 'application/json' } }, callbackFactory(fn));
      },

      find: function(sid, fn) {
        request.get({ uri: uriFor('SMS/Messages/' + sid), headers: { 'Accept' : 'application/json' } }, callbackFactory(fn))
      }
    }
  }

  return Twilio
})()
