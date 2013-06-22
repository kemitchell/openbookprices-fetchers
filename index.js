"use strict";

var _ = require("underscore");

var Fetcher = function () {

};

var scrapers = {
  foyles: require("./src/foyles"),
};


var countryToVendors = {};
_.each(scrapers, function (Scraper, vendor) {
  // var scraper = new Scraper();
  _.each(Scraper.prototype.countries, function (country) {
    countryToVendors[country] = countryToVendors[country] || [];
    countryToVendors[country].push(vendor);
  });
});


Fetcher.getScraper = function (code) {
  return scrapers[code];
};

Fetcher.vendorsForCountry = function (country) {
  return countryToVendors[country] || [];
};

Fetcher.allVendorCodes = function () {
  return _.keys(scrapers);
};

Fetcher.vendorCodes = function () {
  return _.keys(scrapers);
};


Fetcher.fetch = function (options, cb) {

  var scraperName = options.vendor;
  var Scraper     = scrapers[scraperName];

  if (!Scraper) {
    return cb(new Error("Scraper for " + scraperName + " not found"));
  }

  // Run the scraper
  new Scraper(options).scrape(cb);
};


module.exports = Fetcher;
