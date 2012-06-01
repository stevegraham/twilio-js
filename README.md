twilio-js
=========

The Twilio API and TwiML for node.js

## Installation

The library will be availble on npm when released

<pre>npm install slow_down_fast_lane_its_not_ready_yet</pre>

Please use the Github issue tracker to report any issues or bugs you uncover.

## Usage

Require the library in your node application as

```javascript
var Twilio = require('twilio-js');
```

## Configuration

Before invoking any functions that interace with the API, you must set your account SID and auth token. This is done with properties on the `Twilio` object

```javascript
Twilio.AccountSid = "ACxxxxxxxxxxxxxxxxxxxxxxx";
Twilio.AuthToken  = "xxxxxxxxxxxxxxxxxxxxxxxxx";
```

TODO: Raise specific error if API related functions called before account credentials configure?

# Getting started

## Summary

Twilio resources are represented as JavaScript object, e.g. `Twilio.SMS` and operations on those resources are performed via functions that are properties of those objects, e.g. `Twilio.SMS.create`

Resources that can be created via the API, using the HTTP POST verb can be done so in the library using the `.create` function, e.g.

```javascript
Twilio.Call.create({to: "+12125551234", from: "+16465551234", url: "http://example.com/voice"}, function(err,res) {
  // Your code
})
```
When a response is received from the API, the supplied callback function is invoked with an object representation of the resource passed in as the `res` argument as illustrated here. In the case of an error level response, an `Error` object will passed in as the `err` argument.

Resources that can be removed via the API, using the HTTP DELETE verb can be done so in the library using the `destroy` function on the resource object representation, e.g.

```javascript
// Delete all log entries
Twilio.Notification.all(function(err, res) {
  res.forEach(function(obj,i,arr) { obj.destroy() }
}
</pre>


