'use strict';

var WebScraper = require('./web-scraper'),
    countries  = require('country-data').countries,
    _          = require('underscore'),
    config     = require('config');

config.setModuleDefaults('foyles', {
  enabled: true,
});


// note that we can get the worldwide shipping prices from
// http://www.foyles.co.uk/help-delivery
var regions = {
  all: _.chain(countries.all).where({status: 'assigned'}).pluck('alpha2').value(),

  uk: ['GB'],

  europe: [
    // Austria, Belgium, Denmark, France, Germany, Greece, Iceland,
    // Irish Republic, Italy, Luxembourg, Netherlands, Portugal, Spain,
    // Sweden and Switzerland
    'AT', 'BE', 'DK', 'FR', 'DE', 'GR', 'IS', 'IE', 'IT', 'LU', 'NL', 'PT',
    'ES', 'SE', 'CH'
  ],

  northAmerica: ['US', 'CA'],
};

regions.restOfWorld = _.difference(
  regions.all,
  regions.uk, regions.europe, regions.northAmerica
);


var Scraper = module.exports = function (options) {
  this.init(options);
};

Scraper.prototype = new WebScraper();

Scraper.prototype.vendorCode = 'foyles';
Scraper.prototype.name       = 'Foyles';
Scraper.prototype.homepage   = 'http://www.foyles.co.uk/';

Scraper.prototype.countries  = _.chain(['GB', regions.all]).flatten().uniq().value();
Scraper.prototype.currencies = ['GBP'];



Scraper.prototype.isbnURLTemplate = 'http://www.foyles.co.uk/all?term={isbn}';


Scraper.prototype.jqueryExtract = function ($) {

  var results = {
    entries: [],
  };

  if (/No search results/.test($('h2.MainTitle').text())) {

    var notFoundEntry = {
      countries: regions.all,
      offers: {},
    };

    _.each(this.currencies, function (currency) {
      results.entries.push(_.extend({ currency: currency }, notFoundEntry));
    });

    return results;
  }

  $('div.PurchaseTable')
    .find('tr.DarkGrey')
    .first()
    .each(function () {
      var row = $(this);
      if (! row.attr('class')) {
        return;
      }

      var baseFormat = {
        price:            parseFloat(row.find('.OnlinePrice').text().replace(/[\D\.]/, '')) || null,
        availabilityNote: row.find('.Availtext').text().trim(),
      };

      var basePrice = {
        currency:  'GBP',
      };

      // UK
      results.entries.push(_.extend({}, basePrice, {
        countries: regions.uk,
        offers: {
          new: _.extend({
            shipping: baseFormat.price < 10 ? 2.5 : 0,
            shippingNote: 'Free second class delivery in the UK for orders over £10',
          }, baseFormat),
        }
      }));

      // Europe
      results.entries.push(_.extend({}, basePrice, {
        countries: regions.europe,
        offers: {
          new: _.extend({
            shipping: 5,
            shippingNote: 'Air mail from UK: 4 - 14 days',
          }, baseFormat),
        }
      }));

      // N. America
      results.entries.push(_.extend({}, basePrice, {
        countries: regions.northAmerica,
        offers: {
          new: _.extend({
            shipping: 7,
            shippingNote: 'Air mail from UK: 4 - 14 days',
          }, baseFormat),
        }
      }));

      // N. America
      results.entries.push(_.extend({}, basePrice, {
        countries: regions.restOfWorld,
        offers: {
          new: _.extend({
            shipping: 8,
            shippingNote: 'Air mail from UK: 7 - 21 days',
          }, baseFormat),
        }
      }));

    });

  return results;
};
