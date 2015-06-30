
module.exports = {
	threeRunnersRestriction: true,
	maxBetsAllowed: 1,
	minAvailableMoneyToBet: 5,
	totalMatched: 5000,
	// totalMatched: 50000,
	startTime: 60,
	runners: {
		odds: {
			betNowOdd: 1.1,
			maxDeltaOdd: 80,
			minDrawOdd: 13
		},
		size: {
			minSizeBet: 2,
			maxSizeBet: 3
		},
		time: {
			minDiffBetweenBets: 15
		}
	},
	sports: {
		football: {
			AvBdeltaOdd: 2,
			drawOddGreatter: 2.5,
			backOverround: 107,
			layOverround: 95,
			betOnDrawTime: 1,
			betOnDrawDelta: 1
			// deltaOdd: 7,
			// drawOddGreatter: 5.5,
			// backOverround: 102,
			// layOverround: 97,
			// betOnDrawTime: 80,
			// betOnDrawDelta: 2
		},
		tennis: {

		}
	}


};

