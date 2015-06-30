var _ = require('lodash');
var when = require('when');
var request = require('request-promise');
var requestHelper = require('./requestHelper');
var dataUtil = require('./dataUtil');

var MINIMUM_BET_SIZE = 2;
var MAXIMUM_BET_SIZE = 3;

var place = function(markets, totalMoney) {
	'use strict';

	var marketsCopy = Object.create(markets);

	console.log('Available: ' + totalMoney);

	var deferred = when.defer();
	var promises = [];

	var size = calcSizeToBet(marketsCopy, totalMoney);

	_.each(marketsCopy, function(market) {
		if (market.toBet.length === 0) {
			return true;
		}

		_.each(market.toBet, function(selectionToBet) {
			selectionToBet.size = size;

			// var etxRequest = request(requestHelper.place(selectionToBet)).then(function (response) {
			// 	selectionToBet.response = response;
			// 	console.log(response);
			// 	console.log();
			// });

			// MOCK TO BETTING SERVICE
			var etxRequest = myRequest().then(function(response) {
				selectionToBet.response = "Mock request OK";

				market.selections.push({selectionId: JSON.parse(response)[0].result.instructionReports[0].instruction.selectionId});
			});

			promises.push(etxRequest);
		});

		totalMoney -= size;

		// var selection = {};
		// selection.marketId = marketId;
		// selection.winner = dataUtil.extractRunner(market.selection);
		// selection.draw = dataUtil.extractRunner(market.selection.draw);
		// selection.looser = dataUtil.extractRunner(market.selection.looser);

// BETTING SERVICE
		// if (totalMoney > 2) {
		// 	var etxRequest = request(requestHelper.place(selection, wallet)).then(function(response) {
		// 		selection.state = response;
		// 		console.log(JSON.stringify(response));
		// 	});
		// 	totalMoney -= 2;
		// }

// MOCK TO BETTING SERVICE
		// var etxRequest = myRequest(selection).then(function(response) {
		// 	selection.state = response;
		// 	console.log('etx ok ' + JSON.stringify(response));
		// });

		// selections.push(selection);
		// promises.push(etxRequest);
	});

console.log('Total Money: ' + totalMoney);
	
	when.all(promises).then(function() {
		deferred.resolve(markets);
	});

	return deferred.promise;
};

function calcSizeToBet(markets, totalMoney) {
	var totalBets = 1;
	_.each(markets, function(market) {
		totalBets += market.toBet.length;
	});

	var money = totalMoney / totalBets;
	if (money < MINIMUM_BET_SIZE) {
		return MINIMUM_BET_SIZE;
	}

	if (money > MAXIMUM_BET_SIZE) {
		return MAXIMUM_BET_SIZE;
	}

	return money;
}

var myRequest = function() {
	return when('[{"jsonrpc":"2.0","result":{"customerRef":"1434660817901-1.119177238-plc-0","marketId":"1.119177238","instructionReports":[{"instruction":{"selectionId":5562918,"handicap":0.0,"limitOrder":{"size":2.0,"price":1.9,"persistenceType":"LAPSE"},"orderType":"LIMIT","side":"BACK"},"betId":"51898274071","placedDate":"2015-06-18T20:53:37.000Z","averagePriceMatched":1.91,"sizeMatched":2.0,"status":"SUCCESS","orderStatus":"EXECUTION_COMPLETE"}],"status":"SUCCESS"},"id":"1.119177238-plc"}]');
};

module.exports = {
	place: place
};
