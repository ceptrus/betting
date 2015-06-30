'use strict';

var cron = require('cron').CronJob;
var when = require('when');
var request = require('request-promise');
var requestHelper = require('./requestHelper.js');
var dataUtil = require('./DataUtil.js');
var marketRules = require('./MarketRules.js');
var bettingService = require('./BettingService.js');
var db = require('./DataBase.js');

var saveDB = function(markets) {
	var x = db.save(markets);
};

var betNow = function(values) {
	if (!values) {
		return;
	}

	var lbrData = JSON.parse(values[0]);
	var eroData = JSON.parse(values[1]);
	var walletData = JSON.parse(values[2]);
	var facetData = JSON.parse(values[3]);

	var wallet = dataUtil.wallet(walletData);

	var markets = dataUtil.toObject(lbrData, eroData, facetData);
console.log(markets);
// console.log(JSON.stringify(markets));
// console.log('--------');
// console.log("");
	var marketsToBet = marketRules.marketsAvailable(markets);
// console.log(JSON.stringify(marketsToBet));
	var selections = bettingService.place(marketsToBet, wallet);

	return selections;
};

var getEroLbrWallet = function(response) {
	var facetIds = dataUtil.facet(response);
	var marketsId = facetIds.join(',');

	if (marketsId.length === 0) {
		console.log('There are no InPlay events now.');
		return;
	}

	var lbrRequest = request(requestHelper.lbr(marketsId));
	var eroRequest = request(requestHelper.ero(marketsId));
	var walletRequest = request(requestHelper.wallet);

	return when.join(lbrRequest, eroRequest, walletRequest, when(response));
};

var getFacetData = function() {
	return request(requestHelper.facet);
};

// new cron('0,10,20,30,40,50 * * * * *', function() {
    getFacetData()
	    .then(getEroLbrWallet)
	    .then(betNow)
	    .then(saveDB)
	    .then(request(requestHelper.keepAlive));
// }, null, true, "America/Los_Angeles");