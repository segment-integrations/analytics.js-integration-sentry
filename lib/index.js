
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var defaults = require('defaults');
var foldl = require('foldl');
var is = require('is');

/**
 * Expose `Sentry` integration.
 */

var Sentry = module.exports = integration('Sentry')
  .global('Raven')
  .global('RavenConfig')
  .option('config', '')
  .tag('<script src="//cdn.ravenjs.com/1.1.16/native/raven.min.js">');

/**
 * Initialize.
 *
 * http://raven-js.readthedocs.org/en/latest/config/index.html
 * https://github.com/getsentry/raven-js/blob/1.1.16/src/raven.js#L734-L741
 *
 * @api public
 */

Sentry.prototype.initialize = function() {
  var includePaths = this.options.includePaths;
  var ignoreErrors = this.options.ignoreErrors;
  var ignoreUrls = this.options.ignoreUrls;
  var maxMessageLength = this.options.maxMessageLength;
  var logger = this.options.logger;

  var dsn = this.options.config;
  var config = {};

  if (includePaths.length) config.includePaths = stringsToRegExps(includePaths);
  if (ignoreErrors.length) config.ignoreErrors = stringsToRegExps(ignoreErrors);
  if (ignoreUrls.length) config.ignoreUrls = stringsToRegExps(ignoreUrls);
  if (maxMessageLength) config.maxMessageLength = maxMessageLength;
  if (logger) config.logger = logger;

  function stringsToRegExps(arr) {
    return foldl(function(result, val) {
      result.push(new RegExp(val));
      return result;
    }, [], arr);
  }

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
