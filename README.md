twilio-js
=========

The Twilio API and TwiML for node.js

## Usage

```javascript
var Twilio = require('twilio-js');

Twilio.AccountSid = "ACxxxxxxxxxxxxxxxxxxxxxxx";
Twilio.AuthToken  = "xxxxxxxxxxxxxxxxxxxxxxxxx";
```

Send SMS message and print the response to the console
```javascript
Twilio.SMS.create({to: "+12125551234", from: "+16465551234", body: "OMG! My app can text!"}, function(err,res) {
  console.log(err && err.trace || res)
})
```

Make a telephone call, wait 10 seconds and then hangup
```javascript
Twilio.Call.create({to: "+12125551234", from: "+16465551234", url: "http://example.com/voice"}, function(err,res) {
  setTimeout(function() {
    res.hangup()
  }, 10000)
})
```
