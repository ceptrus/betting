'use strict';

var mongo = require('mongodb-bluebird');
var _ = require('underscore');
var moment = require('moment');

var url = 'mongodb://localhost:27017/myproject';

var save = function(selections) {
	var date = moment();
console.log(JSON.stringify(selections));
	mongo.connect(url).then(function(db) {
		var collection = db.collection('documents');

		_.each(selections, function(selection, index) {

			var marketId = selection.marketId;
			selection.date = {};
			selection.date.day = date.date();
			selection.date.year = date.year();
			selection.date.month = date.month() + 1;
			
			get(selection.marketId, collection).then(function(saved) {
				if (saved === null) {
					saved = {marketId: marketId, selections: []};
				}
				saved.selections.push(selection);

				collection.update({marketId: marketId}, saved, { upsert: true }).then(function(result) {
					// if (result.n !== selections.length) {
						//log.warn('guardou result.log de toSave.length')
					// }

					if (index === selections.length-1) {
						console.log('finished');
						db.close();
					}
				}).catch(function(err) {
					throw err;
				});
			});
		});

	}).catch(function(err) {
		throw err;
	});
}

var get = function(marketId, collection) {
	return collection.findOne({marketId: marketId});
}

module.exports = {
	save: save,
	get: get
}
