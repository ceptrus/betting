// 'use strict';

var victim = require('../MarketRules.js');

var assert = require('assert');
// var chai = require('chai');
// var sinon = require('sinon');
// var expect = chai.expect;

// Initialize Chai BDD interface
// chai.use(require('chai-as-promised'));
// chai.should();

describe('Test counter bet', function() {

	// beforeEach(function(done) {

	// });

	it('WIN - Have matched bets', function() {
		var markets = require('./mocks/win');

		var x = victim.marketsAvailable(markets);
		// console.log(JSON.stringify(x));
		console.log(x);
	});
});