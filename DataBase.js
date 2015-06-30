var mongo = require('mongodb-bluebird');
var _ = require('lodash');
var moment = require('moment');
var when = require('when');

var url = 'mongodb://localhost:27017/myproject';

var save = function(markets) {
	'use strict';

	var date = moment();

	var db;
	var collection;
	var deferred = when.defer();

	mongo.connect(url).then(function(dbConnection) {
		db = dbConnection;

		collection = db.collection('v2test1');
		var promises = [];

		_.each(markets, function(market, index) {
			var marketId = market.marketId;
console.log(marketId);
			var marketPromise = get(market.marketId, collection);
			promises.push(marketPromise);

			// .then(upsert.bind(this, market));
		});
	
		when.all(promises).then(function(resolvedMarkets) {
			deferred.resolve({resolved: resolvedMarkets, markets: markets, collection: collection});
		});

		return deferred.promise;
	})
	.then(upsert)
	.then(function() {
		db.close();
	})
	.catch(function(err) {
		throw err;
	});
};

function upsert(resolved) {
	var saved = resolved.resolved;
	var markets = resolved.markets;
	var collection = resolved.collection;

	var deferred = when.defer();
	var promises = [];

	_.each(markets, function(market) {
		var s = getSaved(saved, market.marketId);
		var x = {};

		if (s) {
			x = s;
			x.toBet = s.toBet.concat(market.toBet);
			x.selections = _.merge(s.selections, market.selections);
			// x.runners = addRunners(s.runners, market.runners);
			addRunners(s.runners, market.runners);
		} else {
			x = market;
		}

		var insertPromise = collection.update({marketId: market.marketId}, x, { upsert: true });

		promises.push(insertPromise);
	});

	when.all(promises).then(function() {
		return deferred.resolve();
	});

	return deferred.promise;
}

function addRunners(saved, newRunners) {
	_.forEach(saved, function(savedRunner) {
		var newRunner = getRunner(savedRunner.selectionId, newRunners);

		if (newRunner) {
			savedRunner.exchange.availableToBack = savedRunner.exchange.availableToBack.concat(newRunner.exchange.availableToBack);
			savedRunner.exchange.availableToLay = savedRunner.exchange.availableToLay.concat(newRunner.exchange.availableToLay);
		}
	});

	// return saved;
}

function getRunner(id, runners) {
	for (var i = 0; i < runners.length; i++) {
		var r = runners[i];

		if (r.selectionId === id) {
			return r;
		}
	}
	return null;
}

function getSaved(saved, marketId) {
	if (saved) {
		for (var i = 0; i < saved.length; i++) {
			if (saved[i] && saved[i].marketId === marketId) {
				return saved[i];
			}
		}
	}
	return null;
}

function getDate() {
	date = {};
	date.day = date.date();
	date.year = date.year();
	date.month = date.month() + 1;
	
	return date;
}

var get = function(marketId, collection) {
	return collection.findOne({marketId: marketId});
};

module.exports = {
	save: save,
	get: get
};
