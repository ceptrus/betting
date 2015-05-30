'use strict';

var moment = require('moment');

var cookie = 'l/5XluhfSUMRUhW230zhlPM4Fp/Cnj4IMVxk1TAu368=';

var facetData = JSON.stringify({
	filter: {
		eventTypeIds: [1],
		productTypes: ["EXCHANGE"],
		contentGroup: {
			language: "en",
			regionCode: "UK"
		},
		marketTypeCodes: ["MATCH_ODDS"],
		inPlayOnly: true,
		attachments: ["MARKET_LITE"],
		maxResults: 15,
		selectBy: "FIRST_TO_START"
	},
	currencyCode: "EUR",
	locale: "en_GB"
});

var placeData = function(marketId, selectionId, size, price) {
	var rand = moment().millisecond() + '-' + marketId + '-plc-0';

	return JSON.stringify([
	    {
	    	method: "ExchangeTransactional/v1.0/place",
	    	params: [marketId, [{
	    		selectionId: selectionId,
	    		handicap: 0,
	    		limitOrder: {
	    			size: size,
	    			price: price,
	    			persistenceType: "LAPSE"
	    		},
	    		orderType: "LIMIT",
	    		side: "BACK"
	    	}], rand],
	    	id: marketId + '-plc',
	    	jsonrpc: "2.0"
	    }
	]);
}


module.exports = {
	cashout: function(marketId, percentage) {
		//curl 'https://www.betfair.com/cashout-service/transactional/v1.0/cashout?alt=json&currencyCode=EUR&marketId=1.118951301&quotePercentage=50&quoteValue=0.99&ts=1432839127326' -H 'X-Application: nzIFcwyWhrlwYMrh' -H 'Accept: application/json, text/plain, */*' -H 'Referer: https://www.betfair.com/exchange/plus/' -H 'Origin: https://www.betfair.com' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.65 Safari/537.36' -H 'Content-Type: application/json;charset=UTF-8' --data-binary '{}' --compressed
		return {
			url: 'https://www.betfair.com/cashout-service/transactional/v1.0/cashout?alt=json&currencyCode=EUR&quotePercentage=' + percentage + '&quoteValue=-100&marketId=' + marketId,
			method: 'GET',
			headers: {
				'X-Application': 'nzIFcwyWhrlwYMrh',
				'Accept': 'application/json, text/plain',
				'Content-Type': 'application/json;charset=UTF-8',
				'Cookie': 'ssoid=' + cookie
			}
		}
	},
	place: function(runnerToBet, wallet) {
		var marketId = runnerToBet.marketId;
		var selectionId = runnerToBet.winner.selectionId;
		// var size = runnerToBet.winner.size;
		var size = parseFloat(wallet / 2).toFixed(2);
		if (size < 2) size = wallet;
		if (size > 4) size = 4;
		var price = runnerToBet.winner.price;

		return {
			url: 'https://www.betfair.com/api/etx-json-rpc?alt=json',
			method: 'POST',
			headers: {
				'X-Application': 'nzIFcwyWhrlwYMrh',
				'Accept': 'application/json, text/plain',
				'Content-Type': 'application/json;charset=UTF-8',
				'X-Authentication': cookie,
				'Cookie': 'ssoid=' + cookie
			},
			body: placeData(marketId, selectionId, size, price)
		};
	},
	wallet: {
		url: 'https://www.betfair.com/wallet-service/v3.0/wallets?walletNames=[MAIN]&alt=json',
		method: 'GET',
		headers: {
			'X-Application': 'nzIFcwyWhrlwYMrh',
			'Accept': 'application/json, text/plain',
			'Content-Type': 'application/json;charset=UTF-8',
			'Cookie': 'ssoid=' + cookie
		}
	},
	facet: {
		url: 'https://www.betfair.com/www/sports/navigation/facet/v1/search',
		method: 'POST',
		headers: {
			'X-Application': 'nzIFcwyWhrlwYMrh',
			'Accept': 'application/json, text/plain',
			'Content-Type': 'application/json;charset=UTF-8'
		},
		body: facetData
	},
	ero: function(marketIds) {
		return {
			url: 'https://www.betfair.com/www/sports/exchange/readonly/v1/bymarket?currencyCode=EUR&locale=en_GB&marketIds=' + marketIds + '&rollupLimit=2&rollupModel=STAKE&types=MARKET_STATE,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_BEST&alt=json',
			method: 'GET',
			headers: {
				'X-Application': 'nzIFcwyWhrlwYMrh',
				'Accept': 'application/json, text/plain',
				'Content-Type': 'application/json;charset=UTF-8',
				'Cookie': 'ssoid=' + cookie
			}
		}
	},
	lbr: function(marketIds) {
		return {
			url: 'https://www.betfair.com/www/sports/exchange/reporting/live/v1.0/getMarketPositionViews?alt=json&includeSettledProfit=true&marketIds=' + marketIds + '&matchProjection=MATCH',
			method: 'GET',
			headers: {
				'X-Application': 'nzIFcwyWhrlwYMrh',
				'Accept': 'application/json, text/plain',
				'Content-Type': 'application/json;charset=UTF-8',
				'Cookie': 'ssoid=' + cookie
			}
		};
	}
};