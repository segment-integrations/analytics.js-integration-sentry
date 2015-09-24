
var Analytics = require('analytics.js-core').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Sentry = require('../lib/');

describe('Sentry', function() {
  var sentry;
  var analytics;
  var options = {
    config: 'https://daf6980a0ff243aa9406db1edd7bdedb@app.getsentry.com/25415',
    maxMessageLength: 100,
    ignoreErrors: [],
    ignoreUrls: [],
    logger: 'javascript'
  };

  beforeEach(function() {
    analytics = new Analytics();
    sentry = new Sentry(options);
    analytics.use(Sentry);
    analytics.use(tester);
    analytics.add(sentry);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    sentry.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(Sentry, integration('Sentry')
      .global('Raven')
      .option('config', '')
      .option('ignoreErrors', [])
      .option('ignoreUrls', [])
      .option('maxMessageLength', 100)
      .option('logger', 'javascript'));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(sentry, 'load');
    });

    describe('#initialize', function() {
      it('should call #load', function() {
        analytics.initialize();
        analytics.page();
        analytics.called(sentry.load);
      });

      it('should respect UI settings', function() {
        sentry.options.logger = 'test';
        sentry.options.ignoreErrors = ['testError'];
        sentry.options.ignoreUrls = ['testUrl'];
        sentry.options.maxMessageLength = 25;

        analytics.initialize();
        analytics.assert.deepEqual(window.RavenConfig, {
          dsn: 'https://daf6980a0ff243aa9406db1edd7bdedb@app.getsentry.com/25415',
          config: {
            logger: 'test',
            ignoreErrors: ['testError'],
            ignoreUrls: ['testUrl'],
            maxMessageLength: 25
          }
        });
      });

      it('should favor RavenConfig params from Segment', function() {
        sentry.options.ignoreUrls = ['/test1', '/test2'];
        sentry.options.logger = 'override';

        window.RavenConfig = {};
        window.RavenConfig.config = {
          includePaths: [/\/test3/, /\/test4/]
        };

        analytics.initialize();
        analytics.assert.deepEqual(window.RavenConfig, {
          dsn: 'https://daf6980a0ff243aa9406db1edd7bdedb@app.getsentry.com/25415',
          config: {
            logger: 'override',
            maxMessageLength: 100,
            includePaths: [/\/test3/, /\/test4/],
            ignoreUrls: ['/test1', '/test2']
          }
        });
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(sentry, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.stub(window.Raven, 'setUser');
      });

      it('should send an id', function() {
        analytics.identify('id');
        analytics.called(window.Raven.setUser, { id: 'id' });
      });

      it('should send traits', function() {
        analytics.identify({ trait: true });
        analytics.called(window.Raven.setUser, { trait: true });
      });

      it('should send an id and traits', function() {
        analytics.identify('id', { trait: true });
        analytics.called(window.Raven.setUser, { id: 'id', trait: true });
      });
    });
  });
});
