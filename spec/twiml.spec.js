var Twilio  = require('../lib/twilio.js');

describe('Twilio.TwiML', function() {
  describe('.build', function() {
    it('starts with the XML doctype', function(done) {
      expect(Twilio.TwiML.build()).toEqual("<\?xml version=\"1.0\" encoding=\"UTF-8\"\?>\n");
      done();
    })

    it('capitalises method names before conversion into XML elements so that one can write nice code', function(done) {
      var xml = Twilio.TwiML.build(function(res) {
        res.say('Hey man! Listen to this!', { voice: 'man' });
      });

      var output = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Response>\n    " +
      "<Say voice=\"man\">Hey man! Listen to this!</Say>\n</Response>\n";

      expect(xml).toEqual(output);
      done();
    });

    it('camelizes XML element attributes before conversion into XML elements so that one can write nice code', function(done) {
      var xml = Twilio.TwiML.build(function(res) {
        res.record({ action: "http://foo.com/handleRecording.php", method: "GET", maxLength: "20", finishOnKey: "*" })
      })

      var output = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Response>\n    " +
      "<Record action=\"http://foo.com/handleRecording.php\" method=\"GET\" maxLength=\"20\" finishOnKey=\"*\" />\n</Response>\n";

      expect(xml).toEqual(output);
      done();
    });

    it('works with nested elements', function(done) {
      var xml = Twilio.TwiML.build(function(res) {
        res.gather(function(g) {
          g.say('Now hit some buttons!');
        }, { action: "/process_gather.php", method: "GET" });
      });

      var output = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Response>\n    " +
      "<Gather action=\"/process_gather.php\" method=\"GET\">\n        <Say>Now hit some buttons!</Say>\n    " +
      "</Gather>\n</Response>\n"

      expect(xml).toEqual(output);
      done();
    });
  });
});
