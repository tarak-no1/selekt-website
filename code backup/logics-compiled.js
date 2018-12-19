
var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
	host: 'localhost:9200'
});
// get best mobile from database

// for both attributes and specs
function findSpecMobile(sort, query, filter, fields, callback) {

	console.log("spec", JSON.stringify(sort));
	console.log("query", JSON.stringify(query));
	console.log("filter", JSON.stringify(filter));
	client.search({
		index: 'mobile_database',
		body: {
			fields: fields,
			'sort': sort,
			'filter': filter,
			query: query,
			size: 117
		}

	}).then(function (resp) {
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}

function getValue(fields, brand, callback) {
	client.search({
		index: 'mobile_database',
		body: {
			'fields': fields,
			'query': {
				'match': { 'model_name': brand }
			}
		},
		size: 117

	}).then(function (resp) {
		//x=resp.hits.hits;
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function getAliases(callback) {
	"use strict";

	client.search({
		index: 'mobile_database',
		body: {
			'fields': ["model_name", "alias"],
			'query': {
				'match_all': {}
			}
		},
		size: 120

	}).then(function (resp) {
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}

// singlePhone("Samsung Galaxy S7");

/* ============================================================= */

function singlePhone(model_name, callback) {
	console.log("SINGLE PHONE DETAILS: ", model_name);
	"use strict";
	client.search({
		index: 'mobile_database',

		body: {
			'fields': ['overall_score', 'model_name', 'price', 'os', 'screen_size', 'sim_size', 'processor_type', 'primary_camera_resolution', 'front_camera_resolution', 'no_of_cores', "popular", 'ram_memory', 'internal_memory', 'removable_battery', 'battery_capacity', 'display_resolution'],
			'query': {
				'match_phrase': {
					'model_name': model_name
				}
			},
			size: 117
		}

	}).then(function (resp) {
		console.log("RESPONSE FROM DATABASE");
		console.log(resp);
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function attributeCategorySpecs(fields, model_name, callback) {
	"use strict";

	client.search({
		index: 'mobile_database',
		body: {
			'fields': fields,
			'query': {
				'match_phrase': {
					'model_name': model_name
				}
			}, 'size': 1
		}

	}).then(function (resp) {

		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function findBestMobile(max, min, callback) {
	console.log("function called");
	client.search({
		index: 'mobile_database',
		body: {
			'sort': [{ 'overall_score': "desc", price: 'asc' }],
			'filter': {
				'range': {
					'price': { 'gte': min, 'lte': max }
				}
			},
			size: 100
		}

	}).then(function (response) {
		callback && callback(response);
	}, function (err) {
		console.trace(err.message);
	});
}
function waterProofMobile(max, min, callback) {
	console.log("function called");
	client.search({
		index: 'mobile_database',
		body: {
			'sort': [{ 'overall_score': "desc", price: 'asc' }],
			'bool': {
				'must_not': {
					term: { 'water_proof_rate': "No" }
				},
				'must': { 'range': { 'price': { 'gte': min, 'lte': max } } }
			},
			size: 7
		}

	}).then(function (resp) {

		callback && callback(resp);
	}, function (err) {

		console.trace(err.message);
	});
}
function findPopularPhone(max, min, callback) {
	client.search({
		index: 'mobile_database',
		body: {
			'filter': {
				'range': { 'price': { 'gte': min, 'lte': max } }
			},
			query: { "bool": { "must_not": [{ "match": { "popular": 0 } }] } },
			size: 7
		}

	}).then(function (resp) {

		callback && callback(resp);
	}, function (err) {

		console.trace(err.message);
	});
}
function findBestOs(os, min, max, callback) {
	"use strict";

	client.search({
		index: 'mobile_database',
		body: {
			"sort": { "overall_score": "desc", "version": "desc", price: "asc" },
			"query": { "match": { "os": os } },
			"filter": {
				"range": { "price": { "gte": min, "lte": max } }
			},
			size: 7
		}

	}).then(function (resp) {
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function popularPhones(min, max, callback) {
	"use strict";

	client.search({
		index: 'mobile_database',
		body: {
			"filter": {
				"range": { "price": { "gte": min, "lte": max } }
			},
			"query": {
				"range": { "popular": { "gt": 0 } }
			}

		},
		size: 117

	}).then(function (resp) {

		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function getBuyLink(model_name, callback) {
	"use strict";

	client.search({

		index: 'mobile_database',
		body: {
			'fields': ['purchase_url'],
			'query': { 'match': { 'model_name': model_name } },
			'size': 1
		}

	}).then(function (resp) {
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function getReviews(brand, callback) {
	client.search({
		index: 'mobile_database',
		body: {
			// '_source' : ['reviews'],
			'fields': ['user_review'],
			'query': {
				'match': { 'model_name': brand }
			},
			size: 1
		}
	}).then(function (resp) {
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function getFieldRank(field, field_rank, callback) {
	client.search({
		index: 'mobile_database',
		body: {
			'sort': field_rank,
			'fields': field,
			size: 1
		}
	}).then(function (resp) {
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
/*getFieldRank(["processor_rank","model_name"],["processor_rank"],function(data){
	"use strict";
	console.log(data.hits.hits[0]);
})*/
function dualSimPhone(min, max, callback) {
	"use strict";

	client.search({
		index: 'mobile_database',
		body: {
			"sort": { 'overall_score': 'desc', "price": "asc" },
			"query": { "match": { "sim_type": "Dual" } },
			"filter": {
				"range": { "price": { "gte": min, "lte": max } }
			}
		}

	}).then(function (resp) {
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function singlePhone2(model_name, callback) {
	console.log(model_name);
	"use strict";
	client.search({
		index: 'mobile_database',

		body: {
			'fields': ['model_name', 'price'],
			'query': {
				'match': {
					'model_name': model_name
				}
			}
		}

	}).then(function (resp) {

		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}

/*

getReviews("Samsung Galaxy S7",function(data){
	"use strict";
	console.log(data.hits.hits)
	console.log(data.hits.hits[0]['fields'])
});

*/
function betterMobile(model_name, callback) {
	console.log(model_name);
	"use strict";
	client.search({
		index: 'mobile_database',
		body: {
			'fields': ['primary_camera_resolution', 'processor_rank', 'battery_capacity', 'ram_memory', 'internal_memory', 'screen_size', 'pros'],
			'query': {
				'match_phrase': {
					'model_name': model_name
				}
			}
		}

	}).then(function (resp) {

		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}

function compareMobiles(model_name, callback) {
	console.log(model_name);
	"use strict";
	client.search({
		index: 'mobile_database',
		body: {
			'fields': ['model_name', 'price', 'brand', 'os', 'screen_size', 'processor_type', 'ram_memory', 'internal_memory', 'battery_capacity'],
			'query': {
				'match_phrase': {
					'model_name': model_name
				}
			}
		}

	}).then(function (resp) {

		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function prosConsSKU(fields, model_name, callback) {
	"use strict";

	client.search({
		index: 'mobile_database',
		body: {
			'fields': fields,
			'query': {
				'match_phrase': {
					'model_name': model_name
				}
			}, 'size': 1
		}

	}).then(function (resp) {

		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function brandPhone(brands, min_val, max_val, callback) {
	var min = 0;
	var max = 1000000;
	if (min_val != undefined) min = min_val;
	if (max_val != undefined) max = max_val;

	client.search({
		index: 'mobile_database',
		body: {
			"sort": { 'overall_score': 'desc' },
			"query": { "match": {
					"brand": brands
				} },
			"filter": {
				"range": { "price": { "gte": min, "lte": max } }
			},
			"size": 7
		}

	}).then(function (resp) {
		console.log(resp.hits.hits);
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function filter(max, min, attribute, value, callback) {
	var att = 'match_phrase';

	var obj = {},
	    obj2 = {};
	if (attribute == 'processor_type') {

		obj2['processor_rank'] = 'asc';
	}
	if (attribute == 'gpu') {
		obj2['gpu_rank'] = 'asc';
	}
	if (attribute == 'micro_sd_slot') {
		value = 'yes';
	}
	if (attribute == 'hd_recording') {
		obj2['camera_score'] = 'desc';
	}

	obj[attribute] = value;
	console.log(max);
	console.log(min);

	console.log(obj);
	client.search({
		index: 'mobile_database',
		body: {
			"sort": obj2,
			"query": {
				'match_phrase': obj
			},
			"filter": {
				"range": { "price": { "gte": min, "lte": max } }
			},
			"size": 7
		}

	}).then(function (resp) {
		"use strict";

		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function ratingPhone(platform, rating_fields, sku, callback) {
	client.search({
		index: 'mobile_database',
		body: {
			"fields": rating_fields,
			"query": { "match_phrase": {
					"model_name": sku
				} },
			"size": 1
		}

	}).then(function (resp) {

		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function inBetweenDate(date1, date2, min, max, callback) {
	console.log(date1);
	console.log(date2);
	client.search({
		index: 'mobile_database',
		body: {
			"sort": { 'overall_score': 'desc' },
			"filter": {
				"and": [{
					"range": {
						"announced_date": { "gte": date1, "lte": date2 }
					}
				}, {
					"range": {
						"price": { "gte": min, "lte": max }
					}
				}]
			},
			size: 7
		}

	}).then(function (resp) {
		console.log(resp);
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
function filterPhones(min, max, filter_obj, callback) {

	client.search({
		index: 'mobile_database',
		body: {
			"sort": { 'overall_score': 'desc' },
			"filter": {
				"and": [{
					"range": filter_obj
				}, {
					"range": {
						"price": { "gte": min, "lte": max }
					}
				}]
			},
			size: 7

		}

	}).then(function (resp) {
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}
/*filterPhones(10000,15000, function (data) {
	console.log(data);
})*/
function findSortParam(attribute, max, min, callback) {
	"use strict";

	client.search({
		index: 'mobile_database',
		body: {
			'fields': [attribute],
			'query': {
				'match_all': {}
			}, "filter": {
				"range": {
					"price": { "gte": min, "lte": max }
				}
			}
		}

	}).then(function (resp) {
		callback && callback(resp);
	}, function (err) {
		console.trace(err.message);
	});
}

/*
 singlePhone2("one plus two one plus three",function(data){
 	"use strict";
 	var list  = data.hits.hits;
	 for(var i=0;i<list.length;i++)
			console.log(list[i]["fields"]["model_name"]+"\n");
	 
 });
*/

module.exports = {
	findBestMobile: findBestMobile,
	findSpecMobile: findSpecMobile,
	findBestOs: findBestOs,
	getValue: getValue,
	compareMobiles: compareMobiles,
	attributeCategorySpecs: attributeCategorySpecs,
	brandPhone: brandPhone,
	ratingPhone: ratingPhone,
	dualSimPhone: dualSimPhone,
	filterPhones: filterPhones,
	inBetweenDate: inBetweenDate,
	filter: filter,
	getReviews: getReviews,
	findSortParam: findSortParam,
	getBuyLink: getBuyLink,
	singlePhone: singlePhone,
	betterMobile: betterMobile,
	getFieldRank: getFieldRank,
	prosConsSKU: prosConsSKU,
	popularPhones: popularPhones,
	getAliases: getAliases,
	findPopularPhone: findPopularPhone
};

//# sourceMappingURL=logics-compiled.js.map