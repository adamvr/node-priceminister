# priceminister

## Introduction

This project is a simple wrapper around the priceminister listing api.

## Dependencies

* superagent
* xml2js
* jsonpath
* currency-symbol-map
* accounting

## Example

    var price = require('priceminister');

    price({keywords: 'samsung'})
      .id('<priceminister api key>')
      .done(function (err, results) {
        // ...
      });
