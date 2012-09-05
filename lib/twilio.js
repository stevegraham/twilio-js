module.exports = (function() {
  var request      = require('request');
  var util         = require('util');
  var API_ENDPOINT = 'api.twilio.com';
  var API_VERSION  = '2010-04-01';

  var collectionMethodsFor = function(resource, deletable, mutableProperties) {
    // Helper function for generating resource URI
    var uriFor = function(resource, accountSid, connect) {
      var authSid = connect ? accountSid : Twilio.AccountSid;
      accountSid  = accountSid || Twilio.AccountSid;
      return util.format('https://%s:%s@%s/%s/Accounts/%s/%s.json', authSid, Twilio.AuthToken, API_ENDPOINT, API_VERSION, accountSid, resource);
    };

    // Capitalise param names so use can idomatically pass in camelized
    // param names, e.g. 'fooBar' and have them converted to the format Twilio
    // requires, e.g. 'FooBar'
    var upcaseKeys = function(obj) {
      var dup = {};
      for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
          dup[key.charAt(0).toUpperCase() + key.substring(1)] = obj[key];
        }
      }
      return dup;
    }

    // Generate a callback function and close over the fn variable, so we don't
    // have to deviate from the function signature requests expects while still
    // have the fn variable in scope.
    var callbackFactory = function(fn) {
      return function(e, r, body) {
        // Return if no callback function given. User doesn't care about response.
        if(!fn) return;
        // If a 2xx response, pass in response to callback
        body = JSON.parse(body);
        if(!e && Math.floor(r.statusCode / 100) == 2) {
          fn(null, new ResourceInstance(body));
        } else {
        // else pass in an error object
          fn(new Error(body.message), null);
        }
      }
    }

    var ResourceList = function ResourceList() {};

    // Decorate object with setters corresponding to mutable properties
    var ResourceInstance = function ResourceInstance(obj) {
      // Object with properties to be updated when save() is called.

      Object.defineProperty(this, 'dirtyProperties', { value: {}, enumerable: false })

      var props = {};

      // delegate proxy getters to obj
      for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
          (function() {
            var dup = key;
            var propName = dup.replace(/(\_[a-z])/g, function($1) { return $1.toUpperCase().replace('_','') })

            props[propName] = {
              get: function() { return obj[dup] },
              enumerable: true
            };
          })()
        }
      }

      mutableProperties.forEach(function(element) {
        var key = element[0].toLowerCase() + element.slice(1)
        props[key] = props[key] || {}
        props[key]['set'] = function(val) {
          this.dirtyProperties[element] = val;
          obj[key]                      = val;
        }
      })

      Object.defineProperties(this, props);

      var subresources = obj.subresourceUris
      for(var key in subresources) {
        (function() {
          var authSid = this.connectAppSid ? this.accountSid : Twilio.AccountSid;
          var uri = util.format('https://%s:%s@%s%s', authSid, Twilio.AuthToken, API_ENDPOINT, subresources[key]);
          var descriptor = {
            enumerable: false,
            value: function(fn) {
              request.get({
                headers: { 'Accept' : 'application/json' }, uri: uri }, callbackFactory(fn))
            }
          }

          Object.defineProperty(this, key, descriptor)
        }).apply(this)
      }

      return this;

    }

    ResourceInstance.prototype.save = function(fn) {
      var cb = function(fn) {
        return function(e,r,b) {
          // reset dirtyProperties on success
          for(var key in this.dirtyProperties) {
            if(dirtyProperties.hasOwnProperty(key)) delete dirtyProperties[key];
          }
          // evaluate regular callback
          return callbackFactory(fn)(e,r,b)
        }
      }

      cb = cb.bind(this)

      // use correct accountSid, e.g. twilio connect
      var authSid = this.connectAppSid ? this.accountSid : Twilio.AccountSid;
      var uri = util.format('https://%s:%s@%s%s', authSid, Twilio.AuthToken, API_ENDPOINT, this.uri);
      request.post({ uri: uri,
                     form: this.dirtyProperties,
                     headers: { 'Accept' : 'application/json' } }, cb(fn));

    };

    ResourceInstance.prototype.destroy = function(fn) {
      request.destroy = function(fn) {
        request.delete({ uri: obj.uri, headers: { 'Accept' : 'application/json' } }, callbackFactory(fn));
      }
    }

    var requestFactory = function(method, uri, fn, params) {
      // remove accountSid and connect from params object
      var accountSid, connect;
      if(params) {
        accountSid = params.accountSid; delete params.accountSid;
        connect    = params.connect;    delete params.connect;
      }

      var opts = {
        uri: uriFor(uri, accountSid, connect),
        headers: { 'Accept' : 'application/json' }
      }

      // if we're POSTing. Upcase our params and set as form as Twilio expects
      if(method == 'post') opts['form'] = upcaseKeys(params);

      // if we're doing a GET and have params. upcase and append as querystring to uri property
      if(method == 'get' && params) {
        params = upcaseKeys(params)
        var arr = [];
        var qs  = require('querystring');

        for(var key in params) {
          if (params.hasOwnProperty(key)) {
            arr.push(key + '=' + qs.escape(params[key]));
          }
        }

        // if arr not empty build query string with elements
        if(arr[0]) opts['uri'] = opts.uri + '?' + arr.join('&');
      }

      return request[method](opts, callbackFactory(fn));
    }


    return {
      create: function(params, fn) { requestFactory('post', resource, fn, params) },
      all:    function(fn, params) { requestFactory('get', resource, fn, params) },
      find:   function(sid, fn, params) { requestFactory('get', resource + '/' + sid, fn, params) }
    }
  };

  var Twilio = {
    SMS:                   collectionMethodsFor('SMS/Messages', false, []),
    Call:                  collectionMethodsFor('Calls', false, ['Url', 'Method', 'Status']),
  };

  return Twilio;
})()
