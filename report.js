'use strict';

var when = require('when');
var request = require('request-promise');
var requestHelper = require('./requestHelper.js');
var dataUtil = require('./DataUtil.js');
var db = require('./DataBase.js');
var mongo = require('mongodb-bluebird');
var _ = require('underscore');
var moment = require('moment');

var url = 'mongodb://localhost:27017/myproject';

mongo.connect(url).then(function(db){
	var collection = db.collection('documents');

	collection.find({}).then(function(results) {
		if (results.length === 0) {
			console.log('Nothing to show');
			return;
		}

		var totalData = 0;
		var totalMarkets = results.length;
		var winners = 0;

		_.each(results, function(result) {
			var marketId = result.marketId;

			var runnerWin = true;

			var winnerId = result.selections[0].winner.selectionId;
			var winner = result.selections[0].winner;
			var lastWinner = result.selections[result.selections.length-1].winner;

			_.each(result.selections, function(selection) {
				totalData++;

				if (winner.selectionId !== selection.winner.selectionId) {
					runnerWin = false;
					return true;
				}
			});

			if (runnerWin) {
				winners++;
			} else {
				console.log('MarketId: ' + marketId);
				console.log('Winner:      ' + JSON.stringify(winner));
				// console.log('Looser: ' + JSON.stringify(selection.winner));
				console.log('Last Winner: ' + JSON.stringify(lastWinner));
				console.log();
			}
		});

		var percentage = (winners * 100) / totalMarkets;

		console.log('Total data: ' + totalData);
		console.log('Total markets: ' + totalMarkets);
		console.log('Winners: ' + winners);
		console.log('Percentage: ' + percentage);

		db.close();
	});
});

// var save = function(selections) {
// 	var date = moment();

// 	mongo.connect(url).then(function(db) {
// 		var collection = db.collection('documents');

// 		_.each(selections, function(selection, index) {

// 			var marketId = selection.marketId;
// 			selection.date = {};
// 			selection.date.day = date.date();
// 			selection.date.year = date.year();
// 			selection.date.month = date.month() + 1;
			
// 			get(selection.marketId, collection).then(function(saved) {
// 				if (saved === null) {
// 					saved = {marketId: marketId, selections: []};
// 				}
// 				saved.selections.push(selection);

// 				collection.update({marketId: marketId}, saved, { upsert: true }).then(function(result) {
// 					// if (result.n !== selections.length) {
// 						//log.warn('guardou result.log de toSave.length')
// 					// }

// 					if (index === selections.length-1) {
// 						console.log('finished');
// 						db.close();
// 					}
// 				}).catch(function(err) {
// 					throw err;
// 				});
// 			});
// 		});

// 	}).catch(function(err) {
// 		throw err;
// 	});
// }

// var get = function(marketId, collection) {
// 	return collection.findOne({marketId: marketId});
// }
