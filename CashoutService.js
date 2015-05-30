'use strict';

var _ = require('underscore');
var when = require('when');
var request = require('request-promise');
var requestHelper = require('./requestHelper');
var dataUtil = require('./dataUtil');

var cashout = function cashout(marketId, percentage) {
	console.log('cashout: ' + marketId);
	request(requestHelper.cashout(marketId, percentage)).then(function(response) {
		console.log(response);
	});
}

module.exports = {
	cashout: cashout
}

