

var rules = require('./Rules.js');
var _ = require('lodash');
var moment = require('moment');
var extend = require('util')._extend;
var cashout = require('./CashoutService');

var marketsAvailable = function(markets) {
	'use strict';

	var allowedMarkets = [];

	_.each(Object.keys(markets), function(marketId) {
		var market = markets[marketId];
		market.toBet = [];
		
		if (market.status === 'SUSPENDED') {
			return true;
		}
		if (market.totalMatched < rules.totalMatched) {
			return true;
		}

// 		// check start time
// 		var now = moment();
// 		var startTime = moment(market.marketTime);

// // SOMAR OS 15 min de INtervalo
// // mas só entra no mercado a partir dos 60 min
// 		if (now.diff(startTime, 'minutes') < (rules.startTime + 15)) {
// 			return true;
// 		}

		// var runnersLenght = 3;
		// // only 3 runners allowed
		// if (rules.threeRunnersRestriction && market.runners.length !== runnersLenght) {
		// 	return true;
		// }

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

		var backOverround = getBackOverround(r1, r2, r3);
		var layOverround = getLayOverround(r1, r2, r3);

			console.log(backOverround + ' ' + layOverround);

		if (backOverround > rules.sports.football.backOverround || layOverround < rules.sports.football.layOverround) {
			return true;
		} 


										/************************/
										/*      TO CASHOUT 		*/
										/************************/
		// have bets (matched or unmatched)
		if (market.selections && market.selections.length === 1) {
			// if (timeElapsedIsGreater(market, 60)) {

			// }

			// ***************************************************************
			var cashout = false;
			// prevent multiples bet from the second winner runner
			var newRunnerAlreadyHaveBet = false;

			_.each(market.selections, function(matchedSelection) {
				var selectionId = matchedSelection.selectionId;

				if (runnerToBet.selectionId !== selectionId && !newRunnerAlreadyHaveBet) {
					cashout = true;
				} else {
					newRunnerAlreadyHaveBet = true;
				}
			});

			if (cashout && !newRunnerAlreadyHaveBet) {
				/**
				 *		FAZER CONTRA APOSTA
				 */
				addMarket(allowedMarkets, market, runnerToBet);
				// market.toBet.push(createBet(runnerToBet, marketId));
				return true;
			}

			if (market.selections.length === rules.maxBetsAllowed) {
				return true;
			}
		}


		/**
		 *
		 *				BET ON DRAW
		 *
		 **/

		var b1 = getBack(r1);
		var b2 = getBack(r2);
		var b3 = getBack(r3);

		// bet on draw after min 80
		var football = rules.sports.football;
		if (runnerToBet === r3 && timeElapsedIsGreater(market, football.betOnDrawTime)) {
console.log("no empate");
			var deltaR1 = b3.price - b1.price;
			var deltaR2 = b3.price - b2.price;

			if (deltaR1 < 0 && deltaR2 < 0 && Math.abs(deltaR1) > football.betOnDrawDelta && Math.abs(deltaR2) > football.betOnDrawDelta) {
				addMarket(allowedMarkets, market, runnerToBet);
				// market.toBet.push(createBet(runnerToBet, marketId));
				return true;
			}
		} 

		/**
		 *
		 *				NORMAL CONDITIONS
		 *
		 **/

		if (Math.abs(b1.price - b2.price) > rules.sports.football.AvBdeltaOdd) {
			addMarket(allowedMarkets, market, runnerToBet);
			// market.toBet.push(createBet(runnerToBet, marketId));
			return true;
		}

		// check time constraints
		// if (market.selections.matchs && market.selections.matches.length > 0) {
		// 	var nowPlusMinutes = moment().add(rules.runners.time.minDiffBetweenBets, 'm');
		// 	var lastBetTime = moment(market.selections.matches[0].matchDate);

		// 	if (nowPlusMinutes - lastBetTime < rules.runners.time.minDiffBetweenBets) {
		// 		return true;
		// 	}
		// }

		// if (Math.abs(r1.exchange.availableToBack[0].price - r2.exchange.availableToBack[0].price) > rules.runners.odds.maxDeltaOdd) {
		// 	return true;
		// }



		// if (runnerToBet.exchange.availableToBack[0].price > rules.sports.football. ||
		// 	r3.exchange.availableToBack[0].price < rules.runners.odds.minDrawOdd) {
		// 	return true;
		// }

		// var secondRunner = runnerToBet.selectionId === r1.selectionId ? r2 : r1;

		// // Usar o DataUtil para minimizar a data dos runners ao minimo indispensável :)

		// runnerToBet.draw = r3;
		// runnerToBet.looser = secondRunner;

		// market.selection = runnerToBet;
		// allowedMarkets.toBet[marketId] = market;
	});

	return allowedMarkets;
};

function addMarket(markets, market, runner) {
	market.toBet.push(createBet(runner, market.marketId));
	markets.push(market);
}

var getBackOverround = function(r1, r2, r3) {
	return (1 / getBack(r1).price + 1 / getBack(r2).price + 1 / getBack(r3).price) * 100;
};

var getLayOverround = function(r1, r2, r3) {
	return (1 / getLay(r1).price + 1 / getLay(r2).price + 1 / getLay(r3).price) * 100;
};

function createBet(r, marketId) {
	var bet = {};

	bet.marketId = marketId;
	bet.selectionId = r.selectionId;
	bet.size = 0;
	bet.price = r.exchange.availableToBack[0].price;

	return bet;
}

function getBack(r) {
	return r.exchange.availableToBack[0];
}

function getLay(r) {
	return r.exchange.availableToLay[0];
}

var timeElapsedIsGreater = function(market, time) {
	// check start time
	var now = moment();
	var startTime = moment(market.marketTime);
	var timeBreak = startTime.add(45, 'm');

	// first half time
	if (now < timeBreak) {
		if (now < startTime.add(time, 'm')) {
			return false;
		}
		return true;
	}

	if (now < startTime.add(time + 15, 'm')) {
		return false;
	}
	return true;
};

var hasMoney = function(runner) {
	if (runner && runner.exchange && runner.exchange.availableToBack && runner.exchange.availableToBack.length > 0 &&
		runner.exchange.availableToLay && runner.exchange.availableToLay.length > 0) {
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
		console.log("Isto esta fodido pk nunca devia ter passado aqui");
		return null;
	}

	// THE DRAW IS WINNING
	if (r3.exchange.availableToBack[0].price < r1.exchange.availableToBack[0].price &&
		r3.exchange.availableToBack[0].price < r2.exchange.availableToBack[0].price) {
		return r3;
	}

	if (r1.exchange.availableToBack[0].price < r2.exchange.availableToBack[0].price) {
		return r1;
	}
	return r2;
};

module.exports = {
	marketsAvailable: marketsAvailable
};