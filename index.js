/**
 * Module dependencies
 */
var request = require('superagent')
  , xml2js = require('xml2js')
  , path = require('JSONPath').eval
  , transforms = require('./transforms')
  , _ = require('underscore');

var endpoint = 'http://ws.priceminister.com/listing_ws';
var defaultExtractions = [
  { name: 'name', query: '$..product..headline[0]' },
  { name: 'id', query: '$..product..productid[0]' },
  { name: 'url',
    transform: transforms.addTracking,
    query: '$..product..url[0]'
  },
  { name: 'remaining', query: '$..product..offercounts..new[0]' },
  { name: 'offerPrice',
    transform: transforms.formatPrice,
    query: '$..product..bestprices..new..advertprice[0]'
  }
];

var price = module.exports = function (itemId) {
  return new Price(itemId);
};

var Price = function Price (itemId, opts) {
  this.mode = 'lookup';
  this.extractions = defaultExtractions;

  if ('object' === typeof itemId) {
    if (itemId.id) this.itemId = itemId.id;
    if (itemId.keywords) this.keywords = itemId.keywords, this.mode = 'search';
  } else {
    this.itemId = id;
  }
};

Price.prototype.id = function (id) {
  this.id = id;
  return this;
};

Price.prototype.nav = function (nav) {
  this.nav = nav;
  return this;
};

Price.prototype.done = function (cb) {
  var that = this;
  request(endpoint)
    .query({action: 'listing'})
    .query({login: this.id})
    .query({version: '2014-01-28'})
    .query(this.mode === 'search' ? {kw: this.keywords} : {productids: this.itemId})
    .query({nbproductsperpage: 1})
    .query({nav: this.nav})
    .end(function (err, res) {
      if (err) return cb(err);
      xml2js.parseString(res.text, {trim: true}, function (err, text) {
        if (err) return cb(err);

        // Callback with returned errors
        err = first(text, '$..error..detail[0]');
        if (err) return cb(new Error(err));

        // Extract important things
        return cb(null, extract.call(that, text, that.extractions));
      });
    });
};

var first = function (object, query) {
  var result = path(object, query);
  return result.length ? result[0] : null;
};

var extract = function (text, extractions) {
  var that = this;

  var res = _
    .chain(extractions)
    .map(function (x) {
      var key = x.name
        , val = first(text, x.query);

      // Transform value if we have a transform available
      if (x.transform) val = x.transform.call(that, val);

      return [key, val];
    })
    .filter(function (x) {
      return x[1] !== null;
    })
    .object()
    .value();

  return _.keys(res).length ? res : null;
};
