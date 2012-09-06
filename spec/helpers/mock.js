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

    var obj = JSON.parse(str);

    for(var key in obj) {
      var newKey = key.replace(/(\_[a-z])/g, function($1) { return $1.toUpperCase().replace('_','') })
      if(key != newKey) {
        obj[newKey] = obj[key];
        delete obj[key];
      }
    }

    return obj;
  }

  var mock = function(opts) {
    var accountSid = opts.accountSid || module.exports.AccountSid;
    var authToken  = opts.authToken  || module.exports.AuthToken;
    var statusCode = opts.statusCode || 200;
    var authSid    = opts.connect ? accountSid : module.exports.AccountSid;
    var host       = 'https://' + authSid + ':' + authToken + '@api.twilio.com';
    var path       = opts.uri || '/2010-04-01/Accounts/' + accountSid + '/' + opts.resource + '.json';
    var nock       = opts.chainTo || require('nock')(host);
    var response   = fixture(opts.fixture);
    var authHeader = new Buffer(authSid + ':' + authToken).toString('base64');

    var api = nock.matchHeader('accept', 'application/json').
      matchHeader('Authorization', 'Basic ' + authHeader)

    switch(opts.method) {
      case 'post':
        api = api[opts.method](path, objectToQueryString(opts.body));
        break;

      case 'get':
        var qs = ''
        if (opts.body) qs += '?' + objectToQueryString(opts.body);
        api = api[opts.method](path + qs);
        break;

      default:
        api = api[opts.method](path);
        break;
    }

    api = api.reply(statusCode, response);
    api.response = response;

    return api;
  }

  return mock;
})()
