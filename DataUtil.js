'use strict';

var _ = require('underscore');
var extend = require('util')._extend;

var wallet = function(walletData) {
	return parseFloat(walletData[0].details.amount).toFixed(2);
};

var facet = function(facetData) {
	var results = JSON.parse(facetData).results;

	var marketsId = [];

	for (var i = 0; i < results.length; i++) {
		marketsId.push(results[i].marketId);
	}
	return marketsId;
};

var lbrParser = function(lbrData) {
	return lbrData;
};

var toObject = function(lbr, ero, facet) {
	var markets = {};

	_.each(ero.eventTypes, function(eventType) {
		eventType.eventNodes.forEach(function(eventNode) {
			eventNode.marketNodes.forEach(function(marketNode) {
				var m = Object.create(marketNode);

				var aux = {};
				aux.marketId = m.marketId;
				aux.totalMatched = m.state.totalMatched;
				aux.totalAvailable = m.state.totalAvailable;
				aux.runners = minimizeRunners(m.runners);

				markets[marketNode.marketId] = aux;
			});
		});
	});

	lbr.forEach(function(matched) {
		var x = Object.create(matched);

		var market = markets[x.marketId];
		_.each(x.selections, function(selection) {
			delete selection.orders;
		});
		market.selections = x.selections;
	});

	_.each(Object.keys(markets), function(marketId) {
		var newFacet = Object.create(facet.attachments.liteMarkets[marketId]);

		var aux = {};
		aux.eventTypeId = newFacet.eventTypeId;
		aux.marketTime = newFacet.marketTime;
		aux.marketType = newFacet.marketType;
		aux.totalMatched = newFacet.totalMatched;
		aux.totalAvailable = newFacet.totalAvailable;

		var market = markets[marketId];
		markets[marketId] = extend(market, aux);
	});

	return markets;
};

function minimizeRunners(runners) {
	_.each(runners, function(runner) {
		try {
			delete runner.state;
			delete runner.handicap;
			if (runner.exchange.availableToBack.length > 1) {
				runner.exchange.availableToBack.splice(1, 2);
			}
			if (runner.exchange.availableToLay.length > 1) {
				runner.exchange.availableToLay.splice(1, 2);
			}
		} catch(err) {}
	});
	return runners;
}

var extractRunner = function(runner) {	
	var selection = {};
	selection.selectionId = runner.selectionId;
	selection.price = runner.exchange.availableToBack[0].price;
	selection.size = runner.exchange.availableToBack[0].size;
	selection.side = 'BACK';

	return selection;
};

module.exports = {
	extractRunner: extractRunner,
	wallet: wallet,
	facet: facet,
	lbr: lbrParser,
	toObject: toObject
};