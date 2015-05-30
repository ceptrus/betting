'use strict';

var rules = require('./Rules.js');
var _ = require('underscore');
var moment = require('moment');
var extend = require('util')._extend;
var cashout = require('./CashoutService');

var marketsAvailable = function(markets) {
	var allowedMarkets = {};
	allowedMarkets.toCashout = {};
	allowedMarkets.toBet = {};

	_.each(Object.keys(markets), function(marketId) {
		var market = markets[marketId];

		if (market.state.status === 'SUSPENDED') {
			return true;
		}
		if (market.state.totalMatched < 2500) {
			return true;
		}

										/************************/
										/*      TO CASHOUT 		*/
										/************************/
		// have bets (matched or unmatched)
		if (market.selections.length > 0) {
			// ***************************************************************
			var r1 = market.runners[0];
			var r2 = market.runners[1];
			var r3 = market.runners[2];

			if (!hasMoney(r1) || !hasMoney(r2) || !hasMoney(r3)) {
				return true;
			}

			var runnerToBet = selectRunnerToBet(r1, r2, r3);
			if (!runnerToBet) {
				return true;
			}
		
			var secondRunner = runnerToBet.selectionId === r1.selectionId ? r2 : r1;

			runnerToBet.draw = r3;
			runnerToBet.looser = secondRunner;
/**
 * 		FAZER FULL CASHOUT
 */
if (r3.exchange.availableToBack[0].price < 5) {
	cashout.cashout(marketId, 50);
} else
/**
 * 		FAZER PARTIAL CASHOUT
 */
if (r3.exchange.availableToBack[0].price < 9) {
	cashout.cashout(marketId, 100);
}

			market.selection = runnerToBet;
			// ***************************************************************

			allowedMarkets.toCashout[marketId] = market;
		
			var totalBets = 0;
			_.each(market.selections, function(selection) {
				totalBets += selection.matches.length;
			});
			if (totalBets >= rules.maxBetsAllowed) {
				return true;
			}
		}

										/************************/
										/*      END CASHOUT		*/
										/************************/

		// check time constraints
		if (market.selections.matchs && market.selections.matches.length > 0) {
			var nowPlusMinutes = moment().add(rules.runners.time.minDiffBetweenBets, 'm');
			var lastBetTime = moment(market.selections.matches[0].matchDate);

			if (nowPlusMinutes - lastBetTime < rules.runners.time.minDiffBetweenBets) {
				return true;
			}
		}

		// check start time
		var now = moment();
		var startTime = moment(market.marketTime);

// SOMAR OS 15 min de INtervalo
// mas só entra no mercado a partir dos 60 min
		if (now.diff(startTime, 'minutes') < (60+15)) {
			return true;
		}

		var runnersLenght = 3;

		// only 3 runners allowed
		if (rules.threeRunnersRestriction && market.runners.length !== runnersLenght) {
			return true;
		}

		var r1 = market.runners[0];
		var r2 = market.runners[1];
		var r3 = market.runners[2];

		if (!hasMoney(r1) || !hasMoney(r2) || !hasMoney(r3)) {
			return true;
		}

		// if (Math.abs(r1.exchange.availableToBack[0].price - r2.exchange.availableToBack[0].price) > rules.runners.odds.maxDeltaOdd) {
		// 	return true;
		// }

		var runnerToBet = selectRunnerToBet(r1, r2, r3);
		if (!runnerToBet) {
			return true;
		}
		
		if (runnerToBet.exchange.availableToBack[0].price > rules.runners.odds.betNowOdd ||
			r3.exchange.availableToBack[0].price < rules.runners.odds.minDrawOdd) {
			return true;
		}

		var secondRunner = runnerToBet.selectionId === r1.selectionId ? r2 : r1;

		// Usar o DataUtil para minimizar a data dos runners ao minimo indispensável :)

		runnerToBet.draw = r3;
		runnerToBet.looser = secondRunner;

		market.selection = runnerToBet;
		allowedMarkets.toBet[marketId] = market;
	});

	return allowedMarkets;
};

var hasMoney = function(runner) {
	if (runner && runner.exchange && runner.exchange.availableToBack && runner.exchange.availableToBack.length > 0) {
		if (runner.exchange.availableToBack[0].size >= rules.minAvailableMoneyToBet) {
			return true;
		}
	}
	return false;
};

/**
* Select the runner who have the lower Odd
*/
var selectRunnerToBet = function(r1, r2, r3) {
	if (!r3.exchange.availableToBack ||
		!r2.exchange.availableToBack ||
		!r1.exchange.availableToBack) {
		return null;
	}

	// THE DRAW IS WINNING - don't want to bet
	if (r3.exchange.availableToBack[0].price > r1.exchange.availableToBack[0].price &&
		r3.exchange.availableToBack[0].price > r2.exchange.availableToBack[0].price) {
		return null;
	}

	if (r1.exchange.availableToBack[0].price < r2.exchange.availableToBack[0].price) {
		return r1;
	}
	return r2;
};

module.exports = {
	marketsAvailable: marketsAvailable
}