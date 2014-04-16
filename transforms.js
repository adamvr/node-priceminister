/**
 * Module dependencies
 */
var accounting = require('accounting')
  , util = require('util')
  , currency = require('currency-symbol-map');

/**
 * formatPrice - format currency code and price nicely
 * @param {Object} value
 * @returns {String} formatted price
 * @note Value is expected to be of the form:
 *   { 
 *     currency: [ 'EUR' ],
 *     amount: [ '13.0' ]
 *   }
 */
module.exports.formatPrice = function (val) {
  var code = val && val.currency && val.currency[0]
    , amount = val && val.amount && val.amount[0];

  if (!code || !amount) return null;

  return accounting.formatMoney(amount, currency(code));
};

var trackingTemplate = 'http://track.effiliation.com/servlet/effi.redir?id_compteur=%s&url=%s';
module.exports.addTracking = function (val) {
  var trackingId = this.id;

  return util.format(trackingTemplate, trackingId, val);
};
