require 'json'
require 'active_support/core_ext/string'
require 'active_support/inflector'

resources = {
  sms: {
    module_name:            'SMS',
    mutable_attributes:     [],
    special_case:           'SMS/Messages',
    individual_fixture:     'sms_created',
    list_fixture:           'list_messages',
    params:                 { To: "+12125551234", From: "+16465550000", Body: "OMG! Awesome!" },
    sid_prefix:             'SM',
    persistable:            true
  },

  calls: {
    mutable_attributes:     ['Url', 'Method', 'Status'],
    individual_fixture:     'call_created',
    list_fixture:           'list_calls',
    params:                 { To: "+12125551234", From: "+16465550000", Url: "http://example.com/voice.twiml" },
    sid_prefix:             'CA',
    subresources:           true,
    persistable:            true
  },

  outgoing_caller_ids: {
    mutable_attributes:     ['FriendlyName'],
    individual_fixture:     'caller_id',
    list_fixture:           'list_caller_ids',
    params:                 { PhoneNumber: '+12125551234' },
    sid_prefix:             'PN',
    persistable:            true,
    deletable:              true
  },

  incoming_phone_numbers: {
    mutable_attributes:     ["FriendlyName", "ApiVersion", "VoiceUrl", "VoiceMethod", "VoiceFallbackUrl",
          "VoiceFallbackMethod", "StatusCallback", "StatusCallbackMethod", "VoiceCallerIdLookup",
          "VoiceApplicationSid", "SmsUrl", "SmsMethod", "SmsFallbackUrl", "SmsFallbackMethod",
          "SmsApplicationSid"],

    individual_fixture:     'incoming_phone_number',
    list_fixture:           'list_incoming_phone_numbers',
    params:                 { PhoneNumber: '+12125551234' },
    sid_prefix:             'PN',
    persistable:            true,
    deletable:              true
  },

  applications: {
    mutable_attributes:     ["FriendlyName", "ApiVersion", "VoiceUrl", "VoiceMethod", "VoiceFallbackUrl",
          "VoiceFallbackMethod", "StatusCallback", "StatusCallbackMethod", "VoiceCallerIdLookup",
          "VoiceApplicationSid", "SmsUrl", "SmsMethod", "SmsFallbackUrl", "SmsFallbackMethod",
          "SmsStatusCallback"],

    individual_fixture:     'application',
    list_fixture:           'list_applications',
    params:                 { FriendlyName: 'bob' },
    sid_prefix:             'AP',
    persistable:            true,
    deletable:              true
  },

  connect_apps: {
    mutable_attributes:     ["FriendlyName", "AuthorizeRedirectUrl", "DeauthorizeCallbackUrl", "DeauthorizeCallbackMethod",
                             "Permissions", "Description", "CompanyName", "HomepageUrl"],

    individual_fixture:     'connect_app',
    list_fixture:           'list_connect_apps',
    sid_prefix:             'CN',
    persistable:            false,
  },

  authorized_connect_apps: {
    individual_fixture:     'authorized_connect_app',
    list_fixture:           'list_authorized_connect_apps',
    sid_prefix:             'CN',
    persistable:            false,
  },

  conferences: {
    individual_fixture:     'conference',
    list_fixture:           'list_conferences',
    sid_prefix:             'CF',
    persistable:            false,
    subresources:           true
  },

  queues: {
    mutable_attributes:     ['FriendlyName', 'MaxSize'],
    individual_fixture:     'queue',
    list_fixture:           'list_queues',
    params:                 { FriendlyName: 'bob', MaxSize: 'Infinity' },
    sid_prefix:             'QU',
    # subresources:           true, BUG. hypermedia links not present in queue.
    persistable:            true,
    deletable:              true
  },

  notifications: {
    individual_fixture:     'notification',
    list_fixture:           'list_notifications',
    sid_prefix:             'NO',
    deletable:              true
  },

  transcriptions: {
    individual_fixture:     'transcription',
    list_fixture:           'list_transcriptions',
    sid_prefix:             'TR'
  }

}

resources.each do |resource, opts|
  output = ''
  opts[:resource] ||= resource.capitalize

  resource = opts[:special_case] || resource.to_s.camelize
  constant = opts[:module_name] || resource.to_s.camelize.singularize

  if opts[:params]
    params = opts[:params].to_json
    downcase_params   = Hash[opts[:params].map { |k,v| [k.to_s.camelize(:lower), v] }]
    subaccount_params = downcase_params.merge accountSid: 'AC0000000000000000000000000000'
    connect_params    = subaccount_params.merge connect: true
  end

  downcase_params   = downcase_params.to_json
  subaccount_params = subaccount_params.to_json
  connect_params    = connect_params.to_json

  output << <<EOF
var Twilio  = require('../lib/twilio.js');
var mock    = require('./helpers/mock.js');

Twilio.AccountSid = mock.AccountSid = "SIDneyPoiter";
Twilio.AuthToken  = mock.AuthToken  = "secret";

describe('Twilio.#{constant}', function() {
  var api;

EOF

if opts[:persistable]

  output << <<EOF
  describe('.create', function() {

    it('can use twilio connect', function(done) {
      api = mock({
        accountSid: 'AC0000000000000000000000000000',
        connect:    true,
        resource:   '#{resource}',
        method:     'post',
        fixture:    'connect_#{opts[:individual_fixture]}',
        statusCode: 201,
        body: #{params}
      });

      Twilio.#{constant}.create(#{connect_params}, function(err, res) {
        var instanceMock = mock({
          chainTo:    api,
          accountSid: res.accountSid,
          connect:    true,
          uri:        res.uri,
          method:     'post',
          fixture:    'connect_#{opts[:individual_fixture]}',
          statusCode: 200,
          body: #{ Hash[opts[:mutable_attributes].map { |attr| [attr.camelize, 'foo'] }].to_json }
        });

        // twilio connect uses a different accountSID for auth. We want to ensure we
        // use the correct sid for updating resources
        #{opts[:mutable_attributes].map { |s| s.camelize :lower }}.forEach(function(el) { res[el] = 'foo' });

        res.save(function(err, res) {
          api.done();
          done();
        });
      });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'AC0000000000000000000000000000',
        resource:   '#{resource}',
        method:     'post',
        fixture:    '#{opts[:individual_fixture]}',
        statusCode: 201,
        body: #{params}
      });

      Twilio.#{constant}.create(#{subaccount_params}, function(err, res) {
        api.done();
        done();
      });
    });

    describe('on successfully creating a #{resource} resource', function() {
      var api;

      it('returns an object representation of the API response', function(done) {
        api = mock({
          resource:   '#{resource}',
          method:     'post',
          fixture:    '#{opts[:individual_fixture]}',
          statusCode: 201,
          body: #{params}
        });

        Twilio.#{constant}.create(#{downcase_params}, function(err, res) {
          expect(err).toEqual(null);
          for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
          api.done();
          done()
        });
      });
EOF
  if opts[:deletable]
    output << <<EOF
      describe('the object it returns', function() {
        describe('destroy()', function() {

          it('deletes the given resource', function(done) {
            api = mock({
              resource:   '#{resource}',
              method:     'post',
              fixture:    'call_created',
              statusCode: 201,
              body: #{params}
            });
            Twilio.#{constant}.create(#{params}, function(err, res) {
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
EOF
  end

  if opts[:mutable_attributes].any?
    output << <<EOF

      describe('the object it returns', function() {
        it('has setters corresponding to the mutable properties of the resource the object represents, that update the resource when .save() is called.', function(done) {
          api = mock({
            resource:   '#{resource}',
            method:     'post',
            fixture:    '#{opts[:individual_fixture]}',
            statusCode: 201,
            body: #{params}
          });
          Twilio.#{constant}.create(#{downcase_params}, function(err, res) {
            // Assert a POST is made to the resource URI with the given parameters
            var instanceMock = mock({
              chainTo:    api,
              uri:        res.uri,
              method:     'post',
              fixture:    '#{opts[:individual_fixture]}',
              statusCode: 200,
              body: #{ Hash[opts[:mutable_attributes].map { |attr| [attr.camelize, 'foo'] }].to_json }
            });

            #{opts[:mutable_attributes].map { |s| s.camelize :lower }}.forEach(function(el) { res[el] = 'foo' });
            res.save(function() {
              api.done();
              done();
            });
          });
        });
      });
EOF
  end

  output << <<EOF
    });

    describe('on unsuccessfully creating a #{resource} resource', function() {
      var api = mock({
        resource:   '#{resource}',
        method:     'post',
        fixture:    'api_error',
        statusCode: 422
      });

      it('should return an error object', function(done) {
        Twilio.#{constant}.create({}, function(err, res) {
          expect(err).toEqual(new Error(api.response.message));
          expect(res).toEqual(null);
          api.done();
          done()
        });
      });
    });
  });
EOF
end

output << <<EOF
  describe('.find', function() {
    var api;

    it('can use twilio connect', function(done) {
      api = mock({
        accountSid: 'subaccount',
        connect:    true,
        resource:   '#{resource}/#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    '#{opts[:individual_fixture]}'
      });

      Twilio.#{constant}.find('#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   '#{resource}/#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    '#{opts[:individual_fixture]}'
      });

      Twilio.#{constant}.find('#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });


    it('returns an object representation of the API response', function(done) {
      api = mock({
        resource:   '#{resource}/#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    '#{opts[:individual_fixture]}'
      });

      Twilio.#{constant}.find('#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
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
        resource:   '#{resource}',
        method:     'get',
        fixture:    '#{opts[:list_fixture]}'
      });

      Twilio.#{constant}.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   '#{resource}',
        method:     'get',
        fixture:    '#{opts[:list_fixture]}'
      });

      Twilio.#{constant}.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });

    it('accepts filter paramters for a more specific query', function(done) {
      api = mock({
        resource:   '#{resource}',
        method:     'get',
        fixture:    '#{opts[:list_fixture]}',
        body:       { From: '+12125551234' }
      });

      Twilio.#{constant}.all(function(err, res) {
        api.done();
        done()
      }, { from: '+12125551234' });
    });

    it('returns informations about how many resources there are including an array of resource instances', function(done) {
      api = mock({
        resource:   '#{resource}',
        method:     'get',
        fixture:    '#{opts[:list_fixture]}'
      });

      Twilio.#{constant}.all(function(err, res) {
        expect(err).toEqual(null);
        for(var prop in res) { if(res.hasOwnProperty(prop)) expect(res[prop]).toEqual(api.response[prop]) }
        api.done();
        done()
      });
    })
  });
EOF

if opts[:subresources]
  output << <<EOF
    describe('accessing subresources', function() {
    it('can access subresources using a function with a name corresponding to the subresource name', function(done) {
      api = mock({
        resource:   '#{resource}/#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    '#{opts[:individual_fixture]}'
      });

      Twilio.#{constant}.find('#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        mock({
          chainTo:    api,
          uri:        res.subresourceUris[Object.keys(res.subresourceUris)[0]],
          method:     'get',
          fixture:    'list_' + Object.keys(res.subresourceUris)[0]
        });

        res[Object.keys(res.subresourceUris)[0]](function(err, res) {
          api.done();
          done();
        });
      });
    });
  });
EOF
end
output << <<EOF
});

EOF

  filename = opts[:module_name] || constant

  File.open(File.dirname(__FILE__) + '/' + filename.underscore + '.spec.js', 'w+') do |f|
    f << output
  end

end
