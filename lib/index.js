
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var defaults = require('defaults');
var is = require('is');

/**
 * Expose `Sentry` integration.
 */

var Sentry = module.exports = integration('Sentry')
  .global('Raven')
  .global('RavenConfig')
  .option('config', '')
  .option('ignoreErrors', [])
  .option('ignoreUrls', [])
  .option('maxMessageLength', 100)
  .option('logger', 'javascript')
  .tag('<script src="//cdn.ravenjs.com/1.1.20/native/raven.min.js">');

/**
 * Initialize.
 *
 * http://raven-js.readthedocs.org/en/latest/config/index.html
 * https://github.com/getsentry/raven-js/blob/1.1.20/src/raven.js#L734-L741
 *
 * @api public
 */

Sentry.prototype.initialize = function() {
  var ignoreErrors = this.options.ignoreErrors;
  var ignoreUrls = this.options.ignoreUrls;
  var maxMessageLength = this.options.maxMessageLength;
  var logger = this.options.logger;

  var dsn = this.options.config;
  var config = {};

  if (ignoreErrors.length) config.ignoreErrors = ignoreErrors;
  if (ignoreUrls.length) config.ignoreUrls = ignoreUrls;
  if (maxMessageLength) config.maxMessageLength = maxMessageLength;
  if (logger) config.logger = logger;

  window.RavenConfig = defaults.deep(window.RavenConfig || {}, {
    config: config,
    dsn: dsn
  });

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Sentry.prototype.loaded = function() {
  return is.object(window.Raven);
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Sentry.prototype.identify = function(identify) {
  window.Raven.setUser(identify.traits());
};
