var Timecop = require('./helpers/timecop.js');
Timecop.install()

var Twilio  = require('../lib/twilio.js');
var JWT     = require('jwt-simple');

Twilio.AccountSid = "SIDneyPoiter";
Twilio.AuthToken  = "secret";


var parseScope = function(scope) {
  var qs = require('querystring');
  scope = scope.match(/scope:(client|stream):(incoming|outgoing)\?(\S+)/);
  var arr = [scope[1], scope[2]];
  if(scope[3]) arr.push(qs.parse(scope[3]));
  return arr;
}

describe('Twilio.CapabilityToken', function() {
  describe('.create', function() {
    it('sets iss in the payload', function(done) {
      var token = Twilio.CapabilityToken.create({
        allowIncoming: 'clientId',
        allowOutgoing: 'ApplicationSid'
      });

      var decoded = JWT.decode(token, Twilio.AuthToken);

      expect(decoded.iss).toEqual(Twilio.AccountSid);
      done();
    });

    describe('when no specified expiry time is given', function() {
      it('sets ttl 1 hour from now', function(done) {
        Timecop.freeze(new Date(2012, 1, 21, 14, 30), function() {
          var token = Twilio.CapabilityToken.create({
            allowIncoming: 'clientId',
            allowOutgoing: 'ApplicationSid'
          });

          var decoded      = JWT.decode(token, Twilio.AuthToken);
          var expectedTime = Math.floor(new Date(2012, 1, 21, 15, 30).getTime() / 1000);

          expect(decoded.exp).toEqual(expectedTime);
          done();
        });
      });
    });

    describe('when an expiry time is explicitly passed', function() {
      it('sets ttl as given time', function(done) {
        Timecop.freeze(new Date(2012, 1, 21, 14, 30), function() {
          var token = Twilio.CapabilityToken.create({
            allowIncoming: 'clientId',
            allowOutgoing: 'ApplicationSid',
            expires:       new Date(2012, 1, 21, 23, 45)
          });

          var decoded      = JWT.decode(token, Twilio.AuthToken);
          var expectedTime = Math.floor(new Date(2012, 1, 21, 23, 45).getTime() / 1000);

          expect(decoded.exp).toEqual(expectedTime);
          done();
        });
      });
    });

    it('sets up the correct scopes', function(done) {
      var token = Twilio.CapabilityToken.create({
        allowIncoming: 'clientId',
        allowOutgoing: ['ApplicationSid', { appParam:'foo' }]
      });

      var decoded = JWT.decode(token, Twilio.AuthToken);
      var scopes  = decoded.scope.split(' ');

      var incoming = scopes[0];
      var outgoing = scopes[1];

      expect(parseScope(incoming)).toEqual(["client", "incoming", { clientName: "clientId" }]);
      expect(parseScope(outgoing)).toEqual(["client", "outgoing", { appSid: "ApplicationSid", appParams: "appParam=foo", clientName: "clientId"}]);

      done();
    });
  });
});

