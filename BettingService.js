'use strict';

var _ = require('underscore');
var when = require('when');
var request = require('request-promise');
var requestHelper = require('./requestHelper');
var dataUtil = require('./dataUtil');

var place = function(marketsToBet, wallet) {
	var marketsId = Object.keys(marketsToBet.toBet);

	var totalMoney = wallet;
console.log('Available: ' + totalMoney);
	var deferred = when.defer();
	var selections = [];
	var promises = [];

	_.each(Object.keys(marketsToBet.toCashout), function(marketId) {
		var market = marketsToBet.toCashout[marketId];

		var selection = {};
		selection.marketId = marketId;
		selection.winner = dataUtil.extractRunner(market.selection)
		selection.draw = dataUtil.extractRunner(market.selection.draw);
		selection.looser = dataUtil.extractRunner(market.selection.looser);

		var etxRequest = myRequest(selection).then(function(response) {
			selection.state = response;
		});

		selections.push(selection);
		promises.push(etxRequest);
	});

	_.each(marketsId, function(marketId) {
		var market = marketsToBet.toBet[marketId];

		var selection = {};
		selection.marketId = marketId;
		selection.winner = dataUtil.extractRunner(market.selection)
		selection.draw = dataUtil.extractRunner(market.selection.draw);
		selection.looser = dataUtil.extractRunner(market.selection.looser);

		if (totalMoney > 2) {
			var etxRequest = request(requestHelper.place(selection, wallet)).then(function(response) {
				selection.state = response;
				console.log(JSON.stringify(response));
			});
			totalMoney -= 2;
		}

		// var etxRequest = myRequest(selection).then(function(response) {
		// 	selection.state = response;
		// 	console.log('etx ok ' + JSON.stringify(response));
		// });

		selections.push(selection);
		promises.push(etxRequest);
	});
console.log('Total Money: ' + totalMoney);
	when.all(promises).then(function() {
		deferred.resolve(selections);
	});

	return deferred.promise;
}

var myRequest = function(selection) {
	return when({myState: selection.selectionId});
}

module.exports = {
	place: place
}
