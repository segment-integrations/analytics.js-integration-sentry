'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');
var is = require('is');
var foldl = require('@ndhoule/foldl');
/**
 * Expose `Sentry` integration.
 */

var Sentry = module.exports = integration('Sentry')
  .global('Raven')
  .global('RavenConfig')
  .option('config', '')
  .option('serverName', null)
  .option('release', null)
  .option('ignoreErrors', [])
  .option('ignoreUrls', [])
  .option('whitelistUrls', [])
  .option('includePaths', [])
  .option('maxMessageLength', null)
  .option('logger', null)
  .tag('<script src="https://cdn.ravenjs.com/3.3.0/raven.min.js">');

/**
 * Initialize.
 *
 * https://docs.getsentry.com/hosted/clients/javascript/config/
 * https://github.com/getsentry/raven-js/blob/3.0.2/src/raven.js#L534-L537
 * @api public
 */

Sentry.prototype.initialize = function() {
  var dsnPublic = this.options.config;
  var options = {
    logger: this.options.logger,
    release: this.options.release,
    serverName: this.options.serverName,
    whitelistUrls: this.options.whitelistUrls,
    ignoreErrors: this.options.ignoreErrors,
    ignoreUrls: this.options.ignoreUrls,
    includePaths: this.options.includePaths,
    maxMessageLength: this.options.maxMessageLength
  };
  window.RavenConfig = {
    dsn: dsnPublic,
    config: reject(options)
  };

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
  window.Raven.setUserContext(identify.traits());
};

/**
 * Clean out null values
 */

function reject(obj) {
  return foldl(function(result, val, key) {
    // strip any null or empty string values
    if (val !== null && val !== '' && !is.array(val)) {
      result[key] = val;
    }
    // strip any empty arrays
    if (is.array(val)) {
      var ret = [];
      // strip if there's only an empty string or null in the array since the settings UI lets you save additional rows even though some may be empty strings
      for (var x = 0; x < val.length; x++) {
        if (val[x] !== null && val[x] !== '') ret.push(val[x]);
      }
      if (!is.empty(ret)) {
        result[key] = ret;
      }
    }
    return result;
  }, {}, obj);
}
