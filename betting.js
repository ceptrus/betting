'use strict';

var cron = require('cron').CronJob;
var when = require('when');
var request = require('request-promise');
var requestHelper = require('./requestHelper.js');
var dataUtil = require('./DataUtil.js');
var marketRules = require('./MarketRules.js');
var bettingService = require('./BettingService.js');
var db = require('./DataBase.js');

var availability = function(values) {

	var lbrData = JSON.parse(values[0]);
	var eroData = JSON.parse(values[1]);
	var walletData = JSON.parse(values[2]);
	var facetData = JSON.parse(values[3]);

	var wallet = dataUtil.wallet(walletData);

	var markets = dataUtil.toObject(lbrData, eroData, facetData);

	var marketsToBet = marketRules.marketsAvailable(markets);
// console.log(JSON.stringify(marketsToBet));

	var selections = bettingService.place(marketsToBet, wallet).then(function(selections) {
		// var x = db.save(selections);
	});
};

new cron('0,30 * * * * *', function() {
	console.log();
    request(requestHelper.facet).then(function(response) {
		var facetIds = dataUtil.facet(response);
		var marketsId = facetIds.join(',');

		if (marketsId.length === 0) {
			return;
		}

		var lbrRequest = request(requestHelper.lbr(marketsId));
		var eroRequest = request(requestHelper.ero(marketsId));
		var walletRequest = request(requestHelper.wallet);

		when.join(lbrRequest, eroRequest, walletRequest, when(response)).then(availability);
	});
}, null, true, "America/Los_Angeles");