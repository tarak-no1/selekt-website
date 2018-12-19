var mapFunctions = {

    "positiveSKU": [[['verdict'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['pos_expression']], [['compare', 'sku'], ['sku1']], [['query', 'attribute'], ['sku']]],
    "negativeSKU": [[['verdict'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['neg_expression']], [['compare', 'sku'], ['sku1']], [['query', 'attribute'], ['sku']]],
    "opinionSKU": [[['verdict'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['opinion']], [['compare', 'sku'], ['sku1']], [['query', 'attribute'], ['sku']]],
    "specsOfSKU": [[['verdict'], ['sku']], [['specifications'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['specifications']], [['compare', 'sku'], ['sku1']], [['query', 'attribute'], ['sku']]],
    "getAttributeValueSKU": [[['verdict'], ['sku']], [['specifications'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['attribute']], [['compare', 'sku'], ['sku1']], [['query', 'attribute'], ['sku']]],
    "singlePhoneDetails": [[['verdict'], ['sku']], [['specifications'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['specifications']], [['compare', 'sku'], ['sku1']], [['query', 'attribute'], ['sku']]],
    "dimensionsSKU": [[['verdict'], ['sku']], [['specifications'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['specifications']], [['compare', 'sku'], ['sku1']], [['query', 'attribute'], ['sku']]],
    "specReview": [[['verdict'], ['sku']], [['specifications'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['specifications']], [['compare', 'sku'], ['sku1']], [['query', 'attribute'], ['sku']]],
    "SKUReview": [[['verdict'], ['sku']], [['specifications'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['specifications']], [['compare', 'sku'], ['sku1']], [['query', 'attribute'], ['sku']]],
    "howSpecs": [[['verdict'], ['sku']], [['specifications'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['specifications']], [['compare', 'sku'], ['sku1']], [['query', 'attribute'], ['sku']]],
    "ratingMobile": [[['verdict'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['rating']], [['compare', 'sku'], ['sku1']], [['query', 'attribute'], ['sku']]],
    "posExpression": [],
    "negExpression": [],

    "getAttributeValueALL": [],

    "similarPhones": [[['specifications'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['specifications']], [['compare', 'sku'], ['sku1']]],

    "betterThanSKU": [[['specifications'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['specifications']], [['compare', 'sku'], ['sku1']]],
    "checkAttributeSKU": [[['specifications'], ['sku']], [['attribute'], ['sku']], [['features'], ['sku']], [['sku'], ['specifications']], [['compare', 'sku'], ['sku1']], [['query', 'attribute'], ['sku']]],

    "knowledgeQuestion": [[['attribute'], ['query']]],
    "bestAttributeInMarket": [[['attribute'], ['best']]],
    "buyPhone": [[['sku'], ['where', 'buy']]],
    "compareMobiles": [[['sku1,sku2'], ['compare']], [['better'], ['sku1', 'sku2']], [['better'], ['sku1', 'sku2']]],
    "betterPhoneInTwo": [[['compare'], ['sku1', 'sku2']], [['sku1,sku2'], ['better']]],
    "betterThanPhone": [[['sku'], ['better', 'mobile']]],
    "findAllPhones": [[['session_variable'], ['mobile']], [['prev_list_answer'], ['mobile']], [['attribute'], ['mobile']], [['features'], ['mobile']], [['features', 'list_synonyms'], ['mobile']], [['attribute', 'list_synonyms'], ['mobile']], [['preference'], ['mobile']]],
    "greet": [[[]]]
};

var functionContextMap = {
    "positiveSKU": [['pos_expressions', 'sku'], ['mobile']],
    "negativeSKU": [['neg_expression', 'sku'], ['mobile']],
    "opinionSKU": [['opinion', 'sku'], []],
    "getAttributeValueSKU": [['attribute', 'sku'], ['mobile']],
    "getAttributeValueALL": [['attribute', 'price_range'], ['mobile']],
    "singlePhoneDetails": [['sku'], ['public', 'preference']],
    "specsOfSKU": [['sku', 'features'], []],
    "specReview": [['sku', 'features', 'verdict'], []],
    "SKUReview": [['sku', 'verdict'], []],
    "howSpecs": [['how', 'sku'], []],
    "knowledgeQuestion": [['query'], []],
    // "bestAttributeInMarket" : [['best', 'attribute'],['mobile']],
    "publicTalk": [['sku', 'public'], []],
    // "buyPhone" : [['where', 'buy', 'sku'],[]],
    "negExpression": [['neg_expression'], ["features", "mobile", "attribute"]],
    "posExpression": [['pos_expressions'], ["features", "mobile", "attribute"]],
    "ratingMobile": [['rating', 'sku'], []],
    "compareMobiles": [['compare', 'sku1', 'sku2'], []],
    "betterPhoneInTwo": [['better', 'sku1', 'sku2'], []],
    "betterThanSKU": [['better', 'sku'], []],
    "betterThanPhone": [['better', 'mobile'], ['feature', 'attribute']],
    "findAllPhones": [['mobile'], []],
    "findGenderMobile": [['mobile', 'gender'], ['sku']],
    "dimensionsSKU": [['dimensions', 'sku'], []],
    "similarPhones": [['similar', 'mobile', 'sku'], []],
    "checkAttributeSKU": [['sku', 'does'], []],
    "helpMessage": [['query', 'help'], []],
    "greet": [['greet'], []],
    "destroyEverything": [['clear'], []],
    "profanity": [['profanity'], []],
    "sortPhoneList": [['sort'], []],
    "trivia": [['trivia'], []],
    "complex_sentence": [['complex_sentence'], []]
};

var sessionVariables = ['start_price', 'end_price', 'brand_pref', 'spec_pref'];

function getFunctionName(context) {
    // Create items array
    var items = Object.keys(functionContextMap).map(function (key) {
        return [key, functionContextMap[key]];
    });

    // Sort the array based on the second element length
    items.sort(function (first, second) {
        return second[1][0].length - first[1][0].length;
    });

    for (var i in items) {
        var flag = true;
        for (var j in items[i][1][0]) {
            if (!isKeyExists(items[i][1][0][j], context)) {
                flag = false;
            }
        }
        for (var k in items[i][1][1]) {
            if (isKeyExists(items[i][1][1][k], context)) {
                flag = false;
            }
        }
        if (flag) {
            return items[i][0];
        }
    }
    return null;
}

function getFunctionMap(key) {
    if (mapFunctions[key]) return mapFunctions[key];
    return null;
}

function getFunctionKeys(key) {
    return functionContextMap[key];
}

function isKeyExists(key, json) {
    return key in json;
}

module.exports = {
    getFunctionMap: getFunctionMap,
    getFunctionName: getFunctionName,
    getFunctionKeys: getFunctionKeys
};

//# sourceMappingURL=functions-compiled.js.map

//# sourceMappingURL=functions-compiled-compiled.js.map