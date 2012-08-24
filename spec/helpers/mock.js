module.exports = (function() {
  var objectToQueryString = function(obj) {
    var qs  = require('querystring');
    var arr = [];
    for(var key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(key + '=' + qs.escape(obj[key]));
      }
    }
    return arr.join('&');
  }

  var fixture = function(file) {
    var fs   = require('fs');
    var str  = fs.readFileSync('./spec/fixtures/' + file + '.json').toString();

    return JSON.parse(str);
  }

  var mock = function(opts) {
    var accountSid = opts.accountSid || module.exports.AccountSid;
    var authToken  = opts.authToken  || module.exports.AuthToken;
    var statusCode = opts.statusCode || 200;
    var host       = 'https://' + accountSid + ':' + authToken + '@api.twilio.com';
    var path       = '/2010-04-01/Accounts/' + accountSid + '/' + opts.resource + '.json';
    var nock       = require('nock');
    var response   = fixture(opts.fixture);

    var api = nock(host)[opts.method](path, objectToQueryString(opts.body)).
      reply(statusCode, response);

    api.response = response;

    return api;
  }

  return mock;
})()
