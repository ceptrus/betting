'use strict';

var _ = require('underscore');
var extend = require('util')._extend;

var wallet = function(walletData) {
	return parseFloat(walletData[0].details.amount).toFixed(2);
}

var facet = function(facetData) {
	var results = JSON.parse(facetData).results;

	var marketsId = new Array();

	for (var i = 0; i < results.length; i++) {
		marketsId.push(results[i].marketId);
	}
	return marketsId;
};

var lbrParser = function(lbrData) {
	return lbrData;
};

var toObject = function(lbr, ero, facet) {
	var aux = {};
	var markets = {};
	aux.ero = {};
	aux.lbr = {};
	aux.facet = {};

	_.each(ero.eventTypes, function(eventType) {
		eventType.eventNodes.forEach(function(eventNode) {
			eventNode.marketNodes.forEach(function(marketNode){
				aux.ero[marketNode.marketId] = marketNode;

				markets[marketNode.marketId] = {};
			})
		})
	});

	lbr.forEach(function(matched) {
		aux.lbr[matched.marketId] = matched;
	});

	aux.facet = facet.attachments.liteMarkets;

	_.each(Object.keys(markets), function(marketId) {
		markets[marketId] = extend(aux.lbr[marketId], aux.ero[marketId], aux.facet[marketId]);
		markets[marketId] = extend(markets[marketId], aux.facet[marketId]);
	});

	return markets;
}

var extractRunner = function(runner) {	
	var selection = {};
	selection.selectionId = runner.selectionId;
	selection.price = runner.exchange.availableToBack[0].price;
	selection.size = runner.exchange.availableToBack[0].size;
	selection.side = 'BACK';

	return selection;
}

module.exports = {
	extractRunner: extractRunner,
	wallet: wallet,
	facet: facet,
	lbr: lbrParser,
	toObject: toObject
}