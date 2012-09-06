require 'json'
require 'active_support/core_ext/string'

resources = {
  sms: {
    module_name:            'SMS',
    mutable_attributes:     [],
    resource:               'SMS/Messages',
    individual_fixture:     'sms_created',
    list_fixture:           'list_messages',
    params:                 { To: "+12125551234", From: "+16465550000", Body: "OMG! Awesome!" },
    sid_prefix:             'SM'
  },

  calls: {
    mutable_attributes:     ['Url', 'Method', 'Status'],
    individual_fixture:     'call_created',
    list_fixture:           'list_calls',
    params:                 { To: "+12125551234", From: "+16465550000", Url: "http://example.com/voice.twiml" },
    sid_prefix:             'CA',
    subresources:           true
  }
}

resources.each do |resource, opts|
  opts[:resource] ||= resource.capitalize

  resource = opts[:module_name] || resource.to_s.classify
  params = opts[:params].to_json
  downcase_params = Hash[opts[:params].map { |k,v| [k.camelize, v] }]

  output << <<EOF
var Twilio  = require('../lib/twilio.js');
var mock    = require('./helpers/mock.js');

Twilio.AccountSid = mock.AccountSid = "SIDneyPoiter";
Twilio.AuthToken  = mock.AuthToken  = "secret";

describe('Twilio.#{resource}', function() {

EOF

if opts[:persistable]

  output << <<EOF
  describe('.create', function() {

    it('can use twilio connect', function(done) {
      api = mock({
        accountSid: 'AC0000000000000000000000000000',
        connect:    true,
        resource:   '#{opts[:resource]}',
        method:     'post',
        fixture:    'connect_#{opts[:individual_fixture]}',
        statusCode: 201,
        body: #{params}
      });

      Twilio.#{resource}.create(#{downcase_params}, function(err, res) {
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
        #{opts[:mutable_attributes].map &:camelize}.forEach(function(el) { res[el] = 'foo' });

        res.save(function(err, res) {
          api.done();
          done();
        });
      });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   '#{opts[:resource]}',
        method:     'post',
        fixture:    '#{opts[:individual_fixture]}',
        statusCode: 201,
        body: params
      });

      Twilio.Call.create(#{downcase_params}, function(err, res) {
        api.done();
        done();
      });
    });

    describe('on successfully creating a #{resource} resource', function() {
      var api = mock({
        resource:   '#{opts[:resource]}',
        method:     'post',
        fixture:    '#{opts[:individual_fixture]}',
        statusCode: 201,
        body: #{params}
      });

      it('returns an object representation of the API response', function(done) {
        Twilio.#{resource}.create(#{params}, function(err, res) {
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
              resource:   '#{opts[:resource]}',
              method:     'post',
              fixture:    'call_created',
              statusCode: 201,
              body: #{params}
            });
            Twilio.Call.create({"to":"+12125551234","from":"+16465550000","url":"http://example.com/voice.twiml"}, function(err, res) {
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
EOF
  end

  if opts[:mutable_attributes].any?
    output << <<EOF

      describe('the object it returns', function() {
        it('has setters corresponding to the mutable properties of the resource the object represents, that update the resource when .save() is called.', function(done) {

          Twilio.#{resource}.create(#{downcase_params}, function(err, res) {
            // Assert a POST is made to the resource URI with the given parameters
            var instanceMock = mock({
              chainTo:    mock,
              uri:        res.uri,
              method:     'post',
              fixture:    '#{opts[:individual_fixture]}',
              statusCode: 200,
              body: #{ Hash[opts[:mutable_attributes].map { |attr| [attr.camelize, 'foo'] }].to_json }
            });

            #{opts[:mutable_attributes].map &:camelize}.forEach(function(el) { res[el] = 'foo' });
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
        resource:   '#{opts[:resource]}',
        method:     'post',
        fixture:    'api_error',
        statusCode: 422
      });

      it('should return an error object', function(done) {
        Twilio.#{resource}.create({}, function(err, res) {
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
        resource:   '#{opts[:resource]}/#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    '#{opts[:individual_fixture]}'
      });

      Twilio.#{resource}.find('#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   '#{opts[:resource]}/#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    '#{opts[:individual_fixture]}'
      });

      Twilio.#{resource}.find('#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });


    it('returns an object representation of the API response', function(done) {
      api = mock({
        resource:   '#{opts[:resource]}/#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    '#{opts[:individual_fixture]}'
      });

      Twilio.#{resource}.find('#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
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
        resource:   '#{opts[:resource]}',
        method:     'get',
        fixture:    '#{opts[:list_fixture]}'
      });

      Twilio.#{resource}.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount', connect: true });
    });

    it('can use a subaccount', function(done) {
      api = mock({
        accountSid: 'subaccount',
        resource:   '#{opts[:resource]}',
        method:     'get',
        fixture:    '#{opts[:list_fixture]}'
      });

      Twilio.#{resource}.all(function(err, res) {
        api.done();
        done();
      }, { accountSid: 'subaccount' });
    });

    it('accepts filter paramters for a more specific query', function(done) {
      api = mock({
        resource:   '#{opts[:resource]}',
        method:     'get',
        fixture:    '#{opts[:list_fixture]}'
        body:       { From: '+12125551234' }
      });

      Twilio.#{resource}.all(function(err, res) {
        api.done();
        done()
      }, { from: '+12125551234' });
    });

    it('returns informations about how many sms messages there are including an array of messages', function(done) {
      api = mock({
        resource:   '#{opts[:resource]}',
        method:     'get',
        fixture:    '#{opts[:list_fixture]}'
      });

      Twilio.#{resource}.all(function(err, res) {
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
        resource:   '#{opts[:resource]}/#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e',
        method:     'get',
        fixture:    '#{opts[:individual_fixture]}'
      });

      Twilio.#{resource}.find('#{opts[:sid_prefix]}90c6fc909d8504d45ecdb3a3d5b3556e', function(err, res) {
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

  File.open(File.dirname(__FILE__) + opts[:module_name], 'w+') do |f|
    f << output
  end
end
