'use strict';

const FB = require('./facebook.js');
const Config = require('./../config/const.js');
const Search = require('./logics.js');
const Mappings = require('./mapping.js');
const lContext = require('./localContexts.js');
const Sessions = require('./sessions.js');
const ModelNames = require('./modelNames.js');
var request = require('request');
const fetch = require('node-fetch');
const Messages = require('./messages.js');
const func = require('./functions.js');

//helper functions
const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity][0].value;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};
function findBetterAttribute(compare_result, field) {
    console.log(field, compare_result[0][field], compare_result[1][field]);
    if(field != 'price') {
        if (compare_result[0][field] == compare_result[1][field]) return 0;
        if (compare_result[0][field] < compare_result[1][field]) return 2;
        if (compare_result[0][field] > compare_result[1][field]) return 1;
    } else {
        if (compare_result[0][field] == compare_result[1][field]) return 0;
        if (compare_result[0][field] < compare_result[1][field]) return 1;
        if (compare_result[0][field] > compare_result[1][field]) return 2;
    }
}

function isKeyExists(key, json) {
    if (!(key in json) || json[key] == null || json[key] == undefined) return false;
    return true;
}
function allEntityValue(entities, entity) {
    const array_val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity];

    if (!array_val) {
        return null;
    }

    var list = [];
    for(var i=0;i<array_val.length;i++) {
        var val = array_val[i].value;
        if(typeof val === 'object') val = val.value;
        list.push(val);
    }
    return list;
}
function squash(arr) {
    var tmp = [];
    for (var i = 0; i < arr.length; i++) {
        if (tmp.indexOf(arr[i]) == -1) {
            tmp.push(arr[i]);
        }
    }
    return tmp;
}
function storeValInContext(context, key, value, sessionId) {
    context[key] = value;
    lContext.storeNewKey(sessionId, key, value);
    return context;
}
var sort_by = function (field, reverse, primer) {

    var key = primer ? function (x) {
        return primer(x[field]);
    } : function (x) {
        return x[field];
    };

    reverse = !reverse ? 1 : -1;

    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    };
};
function isSuperSet(a, b) {
    for (var i in a) {
        if (b.indexOf(a[i]) < 0) return false;
    }
    return true;
}
function areKeysExists(a, b) {
    for (var i in a) {
        if (!isKeyExists(a[i], b)) {
            return false;
        }
    }
    return true;
}
function jsonConcat(o1, o2) {
    var o3 = {};
    if (o1 != undefined) {
        var keys = [];
        for (var j in o1) {
            keys.push(j);
        }
        for (var j in keys) {
            var key = keys[j];
            var value = o1[key];
            o3[key] = value;
        }
    }

    if (o2 != undefined) {
        var keys = [];
        for (var j in o2) {
            keys.push(j);
        }
        for (var j in keys) {
            var key = keys[j];
            var value = o2[key];
            o3[key] = value;
        }
    }
    return o3;
}
function addFieldsToList(data) {
    var data3 = [];

    for (var j in data) {
        var obj = {};
        obj["fields"] = data[j];
        data3.push(obj);
    }
    return data3;
}
function extractFieldsFromList(data) {
    // console.log("extract sku from data : " , data[0]);
    var list = [];
    for (var i = 0; i < data.length; i++)
        list.push(data[i]["fields"]);
    return list;
}
function separateKeyValueSKU(data, keys,start,end) {
    var output = "";
    for (var i = start; i < end; i++) {
        var key = Mappings.doesSKUKeyExists(keys[i]) ? Mappings.getSKUKey(keys[i]) : keys[i];
        var units = Mappings.isUnitExists(keys[i])?  Mappings.getUnitKey(keys[i]) : "";
        output += key + " : " + data[keys[i]] + " " + units + "\n";
    }
    return output;
}
function featurePrefMessage(sessionId,source) {
    var messages = [];
    lContext.storeNewKey(sessionId, "prev_message", "specPrefMessage");
    var features = ["Camera", "Display", "Battery", "Performance", "Memory", "All"];
    var featureMsg = "";
    for (var i = 0; i < features.length; i++)
        featureMsg += i + 1 + ". " + features[i] + "\n";

    lContext.storeNewKey(sessionId, "feature_list", features);

    if(source == "fb") {
        messages.push({ type: "text", message: "Which of the following features is most important to you ? " +
                    "Pick the corresponding" + " number. " });
        messages.push({ type: "text", message: featureMsg });

    } else {
        var message = {};
        message["header"] = "Pick either 1 or 2 most important features among the following ";
        message["checklist"] = features;
        message["max_select"] = 2;
        messages.push({type: "checkList", message: message});
    }
    lContext.deleteKey(sessionId, "brandPrefMessage");
    return messages;
}

function addPrevQuery(sessionId, spec_query, filter, prev_spec_query, prev_filter) {

    var output = {};

    // Merging spec_queries
    var prev_query = prev_spec_query.bool;
    var present_query = spec_query.bool;

    console.log(prev_query,present_query);
    var new_query_must_list = [];
    var new_query_must_not_list = [];

    if ( prev_query &&prev_query.must != undefined) {
        var list = prev_query.must;
        for (var i = 0; i < list.length; i++) new_query_must_list.push(list[i]);
    }

    console.log("must prev query")
    if ( present_query && present_query.must != undefined) {
        var list = present_query.must;
        for (var i = 0; i < list.length; i++) new_query_must_list.push(list[i]);
    }

    if ( prev_query && prev_query.must_not != undefined) {
        var list = prev_query.must_not;
        for (var i = 0; i < list.length; i++) new_query_must_not_list.push(list[i]);
    }

    if ( present_query && present_query.must_not != undefined) {
        var list = present_query.must_not;
        for (var i = 0; i < list.length; i++) new_query_must_not_list.push(list[i]);
    }

    var obj = {};
    if (new_query_must_list.length > 0) obj["must"] = new_query_must_list;
    if (new_query_must_not_list.length > 0) obj["must_not"] = new_query_must_not_list;

    spec_query = {};
    spec_query["bool"] = obj;
    console.log("spec query generated",spec_query);

    var added_filters_list = [];

    if (prev_filter && isKeyExists("and", prev_filter)) {
        var list = prev_filter["and"];
        for (var i = 0; i < list.length; i++) {
            added_filters_list.push(list[i]);
        }
    } else {
        added_filters_list.push(prev_filter);
    }

    if (filter && isKeyExists("and", filter)) {
        var list = filter["and"];
        for (var i = 0; i < list.length; i++) {
            added_filters_list.push(list[i]);
        }
    } else {
        added_filters_list.push(filter);
    }

    filter = {};
    filter["and"] = added_filters_list;

    output["query"] = spec_query;
    output["filter"] = filter;
    return output;
}

function storePrevQuery(sessionId, spec_sort, spec_query, filter) {
    var localContext =  lContext.userContext(sessionId);
    var obj = {};
    if(spec_sort  == undefined) spec_sort  = {};
    if(spec_query == undefined) spec_query = {};
    if(filter == undefined) filter ={};
    obj["spec_sort"] = spec_sort;
    obj["spec_query"] = spec_query;
    obj["filter"] = filter;
    lContext.storeNewKey(sessionId, "prev_list_query", obj);
    console.log("stored prev key: ", JSON.stringify(localContext["prev_list_query"]));
}

function breakMessagesForFacebook(messages,delim) {
    var send_message_list = [];
    for(var i=0;i<messages.length;i++){
        var single_message = messages[i];
        if(single_message["type"] == "text") {
            var message = single_message["message"];
            if (message.length > 320) {

                var split_message_list = message.split(delim);
                var generate_message = "";
                for (var j = 0; j < split_message_list.length; j++) {
                    if ((generate_message + split_message_list[j] + delim).length < 320) {
                        generate_message += split_message_list[j] + delim;
                    } else {
                        send_message_list.push({type: "text", message: generate_message});
                        generate_message = split_message_list[j] + delim;
                    }
                }
                send_message_list.push({ type: "text", message:generate_message});

            } else
                send_message_list.push({type: "text", message: message});
        }else {
            send_message_list.push(single_message);
        }
    }
    return send_message_list;
}
function makeListFBFormat(phoneArray) {

    var elements = [];
    // for FB Message sending
    var j = 65;
    for (let i = 0; i < phoneArray.length; i++) {

        var singleObject = {};
        singleObject.title = i + 1 + "." + " " + phoneArray[i]["fields"]["model_name"][0];
        singleObject.image_url = phoneArray[i]["fields"]["pics_urls"][0];
        singleObject.subtitle = "Rs. " + phoneArray[i]["fields"]["price"][0];
        var buttons = [];
        var buy_item_obj = {};
        buy_item_obj.type = "web_url";
        buy_item_obj.url = phoneArray[i]["fields"]["purchase_url"][0];
        buy_item_obj.title = "Buy item";
        buttons.push(buy_item_obj);
        singleObject.buttons = buttons;
        elements.push(singleObject);
    }
    return elements;
}

function addDirectEntitiesToContext(context, entities, sessionId) {
    // Start of direct entities context

    var preference = firstEntityValue(entities,"preference");
    if(preference) context = storeValInContext(context,"preference",preference,sessionId);

    var pos_expr = firstEntityValue(entities,"pos_expressions");
    if(pos_expr) context = storeValInContext(context,"pos_expressions",pos_expr,sessionId);

    var greetings = firstEntityValue(entities,"greet");
    if(greetings) context =  storeValInContext(context,"greet",greetings,sessionId);

    var list_synonyms = firstEntityValue(entities,"list_synonyms");
    if(list_synonyms) context =  storeValInContext(context,"list_synonyms",list_synonyms,sessionId);

    var mobile = firstEntityValue(entities,"mobile");
    if(mobile) context= storeValInContext(context,"mobile",mobile,sessionId);

    var profanity = firstEntityValue(entities,"profanity");
    if(profanity)  context =  storeValInContext(context,"profanity",profanity,sessionId);

    var opinion = firstEntityValue(entities,"opinion");
    if(opinion)  context =  storeValInContext(context,"opinion",opinion,sessionId);

    var gender = firstEntityValue(entities,"gender");
    if(gender)  context =  storeValInContext(context,"gender",gender,sessionId);

    var units = firstEntityValue(entities,"units");
    if(units)  context =  storeValInContext(context,"units",units,sessionId);

    var neg_expr = firstEntityValue(entities,"neg_expression");
    if(neg_expr) context = storeValInContext(context,"neg_expression",neg_expr,sessionId);

    var attribute = firstEntityValue(entities,"attribute");
    if(attribute)  context = storeValInContext(context,"attribute",attribute,sessionId);

    var past_release = firstEntityValue(entities,"past_release");
    if(past_release)  context = storeValInContext(context,"past_release",past_release,sessionId);

    var number = firstEntityValue(entities,"number");
    if(number && processor_type)  lContext.storeNewKey(sessionId,"processor_version",number);

    var sku = firstEntityValue(entities,"sku");
    if(sku)  context = storeValInContext(context,"sku",sku,sessionId);

    var os = firstEntityValue(entities,"os");
    if(os)  context = storeValInContext(context,"os",os,sessionId);

    var similar = firstEntityValue(entities,"similar");
    if(similar)  context = storeValInContext(context,"similar",similar,sessionId);

    var platforms = firstEntityValue(entities,"platforms");
    if(platforms)  context = storeValInContext(context,"platforms",platforms,sessionId);

    var price_range = firstEntityValue(entities,"price_range");
    if(price_range) context = storeValInContext(context, "price_range", price_range,sessionId);

    var clear = firstEntityValue(entities,"clear");
    if(clear) context = storeValInContext(context,"clear",clear,sessionId);

    var specifications = firstEntityValue(entities,"specifications");
    if(specifications) context = storeValInContext(context,"specifications",specifications,sessionId);

    var public_string = firstEntityValue(entities,"public");
    if(public_string) context = storeValInContext(context,"public",public_string,sessionId);

    var review = firstEntityValue(entities,"review");
    if(review) context = storeValInContext(context,"review",review,sessionId);

    var best = firstEntityValue(entities,"best");
    if(best) context = storeValInContext(context,"best",best,sessionId);

    var sort = firstEntityValue(entities,"sort");
    if(sort) context = storeValInContext(context,"sort",sort,sessionId);

    var skip = firstEntityValue(entities,"skip");
    if(skip) context = storeValInContext(context,"skip",skip,sessionId);

    var sim_size = firstEntityValue(entities,"sim_size");
    if(sim_size) context = storeValInContext(context,"sim_size",sim_size,sessionId);

    var buy = firstEntityValue(entities,"buy");
    if(buy) context = storeValInContext(context,"buy",buy,sessionId);

    var popular = firstEntityValue(entities,"popular");
    if(popular) context = storeValInContext(context,"popular",popular,sessionId);

    var stopat = firstEntityValue(entities,"stopat");
    if(stopat) context = storeValInContext(context,"stopat",stopat,sessionId);

    var compare = firstEntityValue(entities,"compare");
    if(compare) { context = storeValInContext(context, "compare", compare,sessionId)};

    var better = firstEntityValue(entities,"better");
    if(better) context = storeValInContext(context,"better",better, sessionId);

    var dimensions = firstEntityValue(entities,"dimensions");
    if(dimensions) context = storeValInContext(context,"dimensions",dimensions,sessionId);

    var num_list = firstEntityValue(entities,"num_list");
    if(num_list) context = storeValInContext(context,"num_list",num_list,sessionId);

    var verdict = firstEntityValue(entities,"verdict");
    if(verdict) context = storeValInContext(context,"verdict",verdict,sessionId);

    var sim_type = firstEntityValue(entities,"sim_type");
    if(sim_type) context = storeValInContext(context,"sim_type",sim_type,sessionId);

    var network_support = firstEntityValue(entities,"network_support");
    if(network_support) context = storeValInContext(context,"network_support",network_support,sessionId);

    var camera_features = firstEntityValue(entities,"camera_features");
    if(camera_features) context = storeValInContext(context,"camera_features",camera_features,sessionId);

    var gps_type = firstEntityValue(entities,"gps_type");
    if(gps_type) context = storeValInContext(context,"gps_type",gps_type,sessionId);

    var usb_type = firstEntityValue(entities,"usb_type");
    if (usb_type) context = storeValInContext(context,"usb_type",usb_type,sessionId);

    var display_type = firstEntityValue(entities,"display_type");
    if(display_type) context = storeValInContext(context,"display_type",display_type,sessionId);

    var gpu_type = firstEntityValue(entities,"gpu_type");
    if(gpu_type) context = storeValInContext(context,"gpu_type",gpu_type,sessionId);

    var processor_core_type = firstEntityValue(entities,"processor_cores");
    if(processor_core_type) context = storeValInContext(context,"processor_core_type", processor_core_type,sessionId);

    var battery_type = firstEntityValue(entities,"battery_type");
    if(battery_type) context = storeValInContext(context,"battery_type",battery_type,sessionId);

    var audio_formats = firstEntityValue(entities,"audio_formats");
    if(audio_formats) context = storeValInContext(context,"audio_formats",audio_formats,sessionId);

    var screen_protection = firstEntityValue(entities,"screen_protection");
    if(screen_protection) context = storeValInContext(context,"screen_protection",screen_protection,sessionId);

    var sensor_type = firstEntityValue(entities,"sensor_type");
    if(sensor_type) context = storeValInContext(context,"sensor_type",sensor_type,sessionId);

    var processor_type = firstEntityValue(entities,"processor_type");
    if(processor_type) context = storeValInContext(context,"processor_type",processor_type,sessionId);

    var phone_properties = firstEntityValue(entities,"phone_properties");
    if(phone_properties) context = storeValInContext(context,"phone_properties",phone_properties,sessionId);

    var intent = firstEntityValue(entities, "intent");
    if(intent) context = storeValInContext(context, 'intent', intent, sessionId);

    var query = firstEntityValue(entities, "query");
    if(query) context = storeValInContext(context, 'query', query, sessionId);


    return context;
}

function definePriceRange(message, context, sessionId) {

    var localContext = lContext.userContext(sessionId);

    console.log("---------- before price range updation-------------");
    console.log(localContext.sessionVars);

    var price_range, start, end;
    price_range = isKeyExists("price_range", context) ? context.price_range : "no";

    if (price_range == 'any' && localContext.prev_message == "priceRangeMessage" ) {
        lContext.storeNewSessionKey(sessionId, "start_price", 0);
        lContext.storeNewSessionKey(sessionId, "end_price", 90000);
    }

    var numberList = extractPrice(message);
    if (!numberList || numberList.length == 0)
        return context;

    numberList = squash(numberList)
    start = numberList[0];
    end = numberList[1];

    if (price_range === 'under') {
        lContext.storeNewSessionKey(sessionId, "start_price", 0);
        lContext.storeNewSessionKey(sessionId, "end_price", start);
    } else if (price_range === 'above') {
        lContext.storeNewSessionKey(sessionId, "start_price", start);
        lContext.storeNewSessionKey(sessionId, "end_price", 100000);
    } else if (price_range === 'between' && numberList.length > 1) {
        lContext.storeNewSessionKey(sessionId, "start_price", start);
        lContext.storeNewSessionKey(sessionId, "end_price", end);
    } else if (price_range === 'around') {
        lContext.storeNewSessionKey(sessionId, "start_price", start - 4000);
        lContext.storeNewSessionKey(sessionId, "end_price", start + 4000);
    } else if( price_range == "no" && start){
        lContext.storeNewSessionKey(sessionId, "start_price", start - 4000);
        lContext.storeNewSessionKey(sessionId, "end_price", start + 4000);
    }

    console.log("---------- after  price range updation-------------");
    console.log(localContext.sessionVars);
    return context;
}

function getSpecFeatures(entities) {

    var feature_array = entities && entities["features"] &&
        Array.isArray(entities["features"]) &&
        entities["features"].length > 0 &&
        entities["features"];


    var attribute_array = entities && entities["attribute"] &&
        Array.isArray(entities["attribute"]) &&
        entities["attribute"].length > 0 &&
        entities["attribute"];


    var price_range = entities && entities["price_range"] &&
        Array.isArray(entities["price_range"]) &&
        entities["price_range"].length > 0 &&
        entities["price_range"];


    if (!feature_array && !attribute_array && !price_range) {
        return null;
    }
    var spec_array = [];
    if(feature_array) spec_array = spec_array.concat(feature_array);
    if(attribute_array) spec_array = spec_array.concat(attribute_array);
    if(price_range) spec_array = spec_array.concat(price_range);


    for(var i = 0; i < spec_array.length; i++) {
        var val = spec_array[i].value;
        if(typeof val === 'object') val = val.value;
        if(val == "camera") return 1;
        if(val == "display") return 2;
        if(val == "battery") return 3;
        if(val == "performance") return 4;
        if(val == "memory") return 5;
        if(val == "any") return 6;
    }
    return null;
}
function checkEntities(message, context, sessionId,entities, callback) {

    var localContext = lContext.userContext(sessionId);
    var numList = extractIntegers(message);

    if ((isKeyExists("compare", context) || isKeyExists("better", context)) &&
        !isKeyExists("sku1", context) && !isKeyExists("sku2", context)) {

        if (isKeyExists("prev_list", localContext) && numList) {
            if (numList.length >= 2) {
                var sku1 = getSKUFromSelector(context, sessionId, numList[0]);
                var sku2 = getSKUFromSelector(context, sessionId, numList[1]);
                if(sku1 != "no") {
                    context = storeValInContext(context, "sku1", sku1, true);
                    lContext.storeNewKey(sessionId,"has_list_reference","exist");
                }
                if(sku != "no") {
                    context = storeValInContext(context, "sku2", sku2, true);
                }
            }
        }
    }

    if (isKeyExists("prev_list", localContext) && localContext["prev_list"] != "all_phone_list" &&
        !isKeyExists("units", context) && !isKeyExists("mobile", context) &&
        !isKeyExists("better", context) && !isKeyExists("compare", context) &&
        !isKeyExists("sku", context)) {

        console.log("finding single sku through numbers");
        if (numList && numList.length != 0 && numList[0] < 8 && !isKeyExists("units", context)) {
            var sku = getSKUFromSelector(context, sessionId, numList[0]);
            if(sku != "no") {
                context = storeValInContext(context, "sku", sku, sessionId);
                lContext.storeNewKey(sessionId,"has_list_reference","exist");
            }
        }

        if (isKeyExists("num_list", context) && !isKeyExists("units", context)) {
            var selector = Mappings.doesHaveAlphabet(context.num_list) ?
                Mappings.getNumberFromAlphabet(context.num_list) : -1;
            sku = getSKUFromSelector(context, sessionId, selector);
            context = storeValInContext(context, "sku", sku,sessionId);
        }
    }


    if (numList && numList.length != 0 && isKeyExists("units", context)) {
        console.log("attribute quantity detected..");
        context = storeValInContext(context, "attribute_quantity", numList[0], true);
    }

    if (localContext["prev_message"] == "brandPrefMessage") {

        lContext.deleteKey(sessionId, "prev_message");
        delete context.brand;
        var all_brand_list = allEntityValue(entities,"brand");
        console.log(all_brand_list);
        if(all_brand_list && all_brand_list.length > 0){
            context = storeValInContext(context, "session_variable", "brand_pref",sessionId);
            lContext.storeNewSessionKey(sessionId, "brand_pref", all_brand_list);
            context = jsonConcat(context, localContext["prev_user_question"]);
        }
        else if(numList && numList.length != 0 ) {
            context = deleteBrands(sessionId, numList, context);
            context = jsonConcat(context, localContext["prev_user_question"]);
        }
    }

    if ( numList && numList.length != 0 &&localContext["prev_message"] == "specPrefMessage") {
       // var featureNumber = getSpecFeatures(entities);
       console.log(numList);
        var feature_list = localContext["feature_list"];
        numList.sort();
        var featurePrefList = [];
        for(var k=0; k < numList.length; k++) {
            var featureNumber =  numList[k];
            if (featureNumber == 6) {
                featurePrefList = ["overall"];
            }else {
                featurePrefList.push(feature_list[featureNumber]);
            }
        }
        lContext.storeNewSessionKey(sessionId, "feature_pref",featurePrefList );
        context = storeValInContext(context, "session_variable", "feature_pref", sessionId);
        context = jsonConcat(context, localContext["prev_user_question"]);

    }

    if (numList && numList.length != 0 && localContext["prev_message"] == "agePrefMessage") {
        lContext.deleteKey(sessionId, "prev_message");
        context = storeValInContext(context,"age",numList[0],sessionId,false);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }

    if (isKeyExists("yes_no", context) && localContext["prev_message"] == "listQuestMessage") {
        context = storeValInContext(context, "prev_list_answer", context.yes_no, true);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }

    if (isKeyExists("preference", context) && localContext["prev_message"] == "front_camera_pref") {
        lContext.storeNewSessionKey(sessionId,"front_camera_pref",context.preference);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }

    if (isKeyExists("preference", context) && localContext["prev_message"] == "video_recording_pref") {
        lContext.storeNewSessionKey(sessionId,"video_recording_pref",context.preference);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }

    if (isKeyExists("preference", context) && localContext["prev_message"] == "photo_storage_pref") {
        lContext.storeNewSessionKey(sessionId,"photo_storage_pref",context.preference);
        context = jsonConcat(context, localContext["prev_user_question"]);

    }

    if (numList && numList.length != 0 && localContext["prev_message"] == "gaming") {
        context = storeValInContext(context,"preference","gaming",sessionId);
        lContext.storeNewSessionKey(sessionId,"gaming",numList);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }

    if (numList && numList.length != 0 && localContext["prev_message"] == "app_running") {
        context = storeValInContext(context,"preference","app_running",sessionId);
        lContext.storeNewSessionKey(sessionId,"app_running",numList);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }

    if (numList && numList.length != 0 && localContext["prev_message"] == "spend_time") {
        context = storeValInContext(context,"preference","spend_time",sessionId);
        lContext.storeNewSessionKey(sessionId,"spend_time",numList);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }


    if (numList && numList.length != 0 && localContext["prev_message"] == "network_type") {
        context = storeValInContext(context,"preference","network_type",sessionId);
        lContext.storeNewSessionKey(sessionId,"network_type",numList);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }
    if (numList && numList.length != 0 && localContext["prev_message"] == "spend_time_battery") {
        context = storeValInContext(context,"preference","spend_time_battery",sessionId);
        lContext.storeNewSessionKey(sessionId,"spend_time_battery",numList);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }

    if(numList && numList.length !=0 && localContext["prev_message"] == "relevant_internal_memory"){
        context = storeValInContext(context,"preference","relevant_internal_memory",sessionId);
        lContext.storeNewSessionKey(sessionId,"relevant_internal_memory",numList);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }
    if(numList && numList.length !=0 && localContext["prev_message"] == "micro_sd_card_cost"){
        context = storeValInContext(context,"preference","micro_sd_card_cost",sessionId);
        lContext.storeNewSessionKey(sessionId,"micro_sd_card_cost",numList);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }

    if (localContext["prev_message"] == "after_battery_important") {
        context = storeValInContext(context,"preference","after_battery_important",sessionId);
        if(isKeyExists("features",context))
            lContext.storeNewSessionKey(sessionId,"after_battery_important",context.features);
        else
            lContext.storeNewSessionKey(sessionId,"after_battery_important","nothing");
        context = jsonConcat(context, localContext["prev_user_question"]);
    }


    if (isKeyExists("preference", context) && localContext["prev_message"] == "record_videos") {
        lContext.storeNewSessionKey(sessionId,"record_videos",context.preference);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }
    if (numList && numList.length != 0 && localContext["prev_message"] == "after_camera_important") {
        context = storeValInContext(context,"preference","after_camera_important",sessionId);
        lContext.storeNewSessionKey(sessionId,"after_camera_important",numList);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }


    if (numList && numList.length != 0 && localContext["prev_message"] == "frequent_use_activity") {
        context = storeValInContext(context,"preference","frequent_use_activity",sessionId);
        lContext.storeNewSessionKey(sessionId,"frequent_use_activity",numList);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }
    if (numList && numList.length != 0 && localContext["prev_message"] == "use_phone_light") {
        context = storeValInContext(context,"preference","use_phone_light",sessionId);
        lContext.storeNewSessionKey(sessionId,"use_phone_light",numList);
        context = jsonConcat(context, localContext["prev_user_question"]);
    }

    if ( localContext["prev_message"] == "priceRangeMessage" && isKeyExists("start_price",localContext.sessionVars)) {
        lContext.deleteKey(sessionId, "prev_message");
        context = jsonConcat(context, localContext["prev_user_question"]);
    }

    if(isKeyExists("skip",context)){
        if(!isKeyExists("brand_pref",localContext.sessionVars))
            lContext.storeNewSessionKey(sessionId,"brand_pref",[]);
        if(!isKeyExists("feature_pref",localContext.sessionVars))
            lContext.storeNewSessionKey(sessionId,"feature_pref","overall");
        delete context.skip;
        context = jsonConcat(context, localContext["prev_user_question"]);
    }

    var preFunction = isKeyExists("preFunction", localContext) ? localContext["preFunction"] : null;
    console.log("Prev function : " + preFunction);
    var functionMap = func.getFunctionMap(preFunction);

    if (functionMap != null) {
        functionMap.sort(function (a, b) {
            return b[0].length - a[0].length;
        });

        for (var i = 0; i < functionMap.length; i++) {
            var leftKeys = functionMap[i][0];
            var rightKeys = functionMap[i][1];

            if (areKeysExists(leftKeys, context)) {
                var validFunction = func.getFunctionName(context);
                console.log("matched function: ", validFunction);


                if (validFunction != null) {
                    var validKeys = func.getFunctionKeys(validFunction)[0];
                    var isSuperset = validKeys.every(function (val) {
                        return leftKeys.indexOf(val) >= 0;
                    });
                    if (isSuperset) {
                        var json2 = {};
                        for (var j = 0; j < rightKeys.length; j++) {
                            json2[rightKeys[j]] = localContext[rightKeys[j]];
                        }
                        console.log("adding To function : ", json2);
                        context = jsonConcat(context, json2);
                    }
                } else {
                    var json2 = {};
                    for (var j = 0; j < rightKeys.length; j++) {
                        json2[rightKeys[j]] = localContext[rightKeys[j]];
                    }
                    console.log("adding To function: ", json2);
                    context = jsonConcat(context, json2);
                }
                break;
            }
        }
    }
    callback && callback(context);
}

function getSKUFromSelector(context, sessionId, position) {
    var localContext = lContext.userContext(sessionId);
    var prev_list = localContext["prev_total_list"];
    console.log(" prev list  ",typeof  prev_list +"  " + prev_list.length );
    console.log(" alphabet " ,position);
    if(position > 0) {
        var sku = prev_list[position - 1]["fields"]["model_name"][0];
        console.log(" sku name ", sku);
        return sku;
    }
    return "no"
}

function getSKUAlias(message, callback) {
    var aliases = [];
    var skuList = [];
    var indexList = [];
    var findAliasList = [];

    Search.getAliases(function (data) {
        var new_data = data.hits.hits;
        var model_name = new_data[0]["fields"]["model_name"][0];
        var alias = eval('(' + new_data[0]["fields"]["alias"][0] + ')');

        for (var i = 0; i < new_data.length; i++) {
            var obj = {};
            var model = new_data[i]["fields"]["model_name"][0];

            obj["model_name"] = model;
            var ali = eval('(' + new_data[i]["fields"]["alias"][0] + ')');
            obj["alias"] = ali;

            aliases.push(obj);
        }

        var matched_alias_list = [];
        for (var i in aliases) {
            var model = aliases[i];
            var found_sku_alias_list = [];
            for (var j in model["alias"]) {
                var sku_alias = model["alias"][j].toLowerCase();
                sku_alias = sku_alias.trim();
                var index = message.indexOf(sku_alias);
                if (index > -1 && sku_alias.length != 0) {
                    // skuList.push(model["model_name"]);
                    // indexList.push(index);
                    //findAliasList.push(sku_alias);
                    if(message[index - 1] == " " || index == 0)found_sku_alias_list.push(sku_alias);
                }
            }
            if (found_sku_alias_list.length > 0) {
                var obj = {};
                obj["model_name"] = model["model_name"];
                obj["alias"] = found_sku_alias_list;
                matched_alias_list.push(obj);
            }
        }
        for (var i = 0; i < matched_alias_list.length; i++) {
            var alias_list = matched_alias_list[i]["alias"];
            var max_length = -1;
            for (var j = 0; j < alias_list.length; j++) {
                if (alias_list[j].length > max_length)
                    max_length = alias_list[j].length;
            }
            matched_alias_list[i]["length"] = max_length;
        }

        matched_alias_list = matched_alias_list.sort(sort_by("length", true, null));

        //var first_sku = matched_alias_list[sku_pos]["model_name"];

        skuList = [];
        var aliasList = [];
        for (var i = 0; i < matched_alias_list.length; i++){
            skuList.push(matched_alias_list[i]["model_name"]);
            aliasList.push(matched_alias_list[i]["alias"]);
        }

        var output = {};
        output["skus"] = squash(skuList);
        output["aliases"] = aliasList;
        callback && callback(output);
    });
}
function extractIntegers(message, callback) {

    message = message.replace(/,/g, "");
    var numbers_in_text = message.match(/\d+k?/g);
    var number_list = [];
    if (numbers_in_text && numbers_in_text.length > 0) {
        for (var i = 0; i < numbers_in_text.length; i++) {
            if (numbers_in_text[i].indexOf('k') > -1) number_list.push(parseInt(numbers_in_text[i].split('k')[0]) * 1000);
            number_list.push(numbers_in_text[i] = parseInt(numbers_in_text[i]));
        }
        return number_list.sort();
    } else return numbers_in_text;
}
function extractPrice(message, callback) {
    message = message.replace(/,/g, "");
    var numbers_in_text_with_k = message.match(/\d+k?/g);
    var numbers_in_text_with_space_k = message.match(/\d+\sk?/g);
    var numbers_in_text_with_thousand = message.match(/([\d.]+) *thousand/);
    var numbers_in_text = [];
    if (numbers_in_text_with_k) numbers_in_text = numbers_in_text.concat(numbers_in_text_with_k);
    if(numbers_in_text_with_space_k) numbers_in_text = numbers_in_text.concat(numbers_in_text_with_space_k);
    if (numbers_in_text_with_thousand) numbers_in_text = numbers_in_text.concat(numbers_in_text_with_thousand);
    var number_list = [];
    if (numbers_in_text && numbers_in_text.length > 0) {
        for (var i = 0; i < numbers_in_text.length; i++) {
            if (numbers_in_text[i].indexOf('k') > -1)
                number_list.push(parseInt(numbers_in_text[i].split('k')[0]) * 1000);
            else if (numbers_in_text[i].indexOf('thousand') > -1)
                number_list.push(parseInt(numbers_in_text[i].split('k')[0]) * 1000);
            else if (parseInt(numbers_in_text[i]) >= 1000 || parseInt(numbers_in_text[i]) == 0) {
                number_list.push(numbers_in_text[i] = parseInt(numbers_in_text[i]));
            }
        }
        return number_list.sort(function (a, b) {  return a - b;  });
    }
    return numbers_in_text;
}

function deleteBrands(sessionId, num_list, context) {

    for (var i = 0; i < num_list.length; i++) {
        if (num_list[i] == 0) {
            context = storeValInContext(context, "session_variable", "brand_pref",sessionId);
            lContext.storeNewSessionKey(sessionId, "brand_pref", []);
            return context;
        }
    }

    var localContext = lContext.userContext(sessionId);
    var phone_list = localContext["prev_total_list"];
    var brandList = getBrands(phone_list);
    brandList = brandList.sort(sort_by("count",true,null));

    console.log("old phone list size", phone_list.length);

    var removedBrands = [];
    for (var i = 0; i < num_list.length; i++)
        removedBrands.push(brandList[ num_list[i] -1 ]["brand"]);

    removedBrands = squash(removedBrands);
    var brand_pref = [];
    console.log("removing brands,", removedBrands);
    context = storeValInContext(context, "session_variable", "brand_pref",sessionId);
    lContext.storeNewSessionKey(sessionId, "brand_pref", removedBrands);
    console.log("brand pref updated..");
    console.log(brand_pref);
    return context;

}
function getBrands(phone_list) {

    var list = phone_list;
    var brands = [];
    for (var i = 0; i < list.length; i++)
        brands.push(list[i]["fields"]["brand"][0]);

    brands = squash(brands);
    var brandList = [];
    for (var i = 0; i < brands.length; i++) {
        var count = 0;
        for (var j = 0; j < list.length; j++) {
            if (brands[i] == list[j]["fields"]["brand"][0]) count++;
        }
        brandList.push({ id: i + 1, brand: brands[i], count: count });
    }
    return brandList;
}
function findAllPhonesHelper(phone_list, context, sessionId) {

    var messages = [];
    var localContext = lContext.userContext(sessionId);
    if (phone_list.length == 0) {
        lContext.deleteKey(sessionId, "prev_list_query");
        messages.push({ type: "text", message: Messages.listMessage("notAvailable") });
        return messages;
    }
    lContext.storeNewKey(sessionId, "prev_total_list", phone_list);
    lContext.storeNewKey(sessionId, "prev_list", "all_phone_list");

    var brandList = getBrands(phone_list);
    brandList = brandList.sort(sort_by("count",true,null));

    var brandMessage = "";
    var len = brandList.length;
    if (brandList.length > 9) len = 9;

    for (var i = 0; i < len; i++)
        brandMessage += (i+1) + ". " + brandList[i]["brand"] + "(" + brandList[i]["count"] + ")" + "\n";

    if (brandList.length < 4) {
        lContext.storeNewKey(sessionId, "brand_pref", []);
    }

    var top_message = Messages.messageKeyValue("listLength",phone_list.length);
    messages.push({ type: "text", message: top_message });
    messages.push({ type: "text", message: Messages.listMessage('brandPrefMessage') });
    messages.push({ type: "text", message: brandMessage });
    lContext.storeNewKey(sessionId, "prev_message", "brandPrefMessage");
    lContext.deleteKey(sessionId, "specPrefMessage");

    
    return messages;
}

function sortPhoneListByKey(phone_list,sessionId,db_key){

    phone_list = extractFieldsFromList(phone_list);

    for(var m=0;m< phone_list.length;m++){
        var pmr = parseInt(phone_list[m][db_key][0]);
        phone_list[m][db_key] = pmr;
    }

    phone_list = phone_list.sort(sort_by(db_key,true,null));

    for(var n=0;n<phone_list.length;n++){
        var pmr =  phone_list[n][db_key];
        var temp_list = [pmr];
        phone_list[n][db_key] = temp_list;
    }
    phone_list = addFieldsToList(phone_list);
    return phone_list;
}

function printPhoneList(phone_list, db_key){
//    console.log("===============================");
    var message= "\t\t\t PHONE LIST LENGTH: "+ phone_list.length +"\n\t\t\t";
    for(var i=0;i<phone_list.length;i++){
         message += phone_list[i]["fields"]["model_name"][0] + "   " +phone_list[i]["fields"][db_key][0] + "\n\t\t\t";
    }
  //  console.log(message);
  //  console.log("=================================");
}
function filterPhonesBasedFeatureQuest(phone_list,sessionId,db_key,percentile,arrange,use_case_preference_key){
   // console.log(" ... filter phones based feature question ... ");

   // console.log(" ==========================  before sort " + db_key +  " ================== "  );
    printPhoneList(phone_list,db_key);
    phone_list = extractFieldsFromList(phone_list);

    for(var m=0;m< phone_list.length;m++){
        var aval = parseInt(phone_list[m][db_key][0]);
        phone_list[m][db_key] = aval;
    }

    phone_list = phone_list.sort(sort_by(db_key,false,null));

    var find_percentile_position_value = Math.round(phone_list.length * percentile);
    var marked_attribute_value = phone_list[find_percentile_position_value][db_key];
  //  console.log(" MARKED ATTRIBUTE VALUE " , marked_attribute_value);
    var key = use_case_preference_key+"_marked_value";
    var units = Mappings.isUnitExists(db_key) ? Mappings.getUnitKey(db_key) : "";
    var value = marked_attribute_value + " " + units ;
    lContext.storeNewKey(sessionId,key,value);

    if(arrange == "greater") {
        phone_list = phone_list.filter(function (data) {
            return data[db_key] >= marked_attribute_value;
        });
    } else if ( arrange == "lesser"){
        phone_list = phone_list.filter(function (data) {
            return data[db_key] <= marked_attribute_value;
        });
    }

    for(var n=0;n<phone_list.length;n++){
        var aval =  phone_list[n][db_key];
        var temp_list = [aval];
        phone_list[n][db_key] = temp_list;
    }

    phone_list = addFieldsToList(phone_list);

    //console.log(" =========================  after sort "+ db_key  +" ==================");
    printPhoneList(phone_list, db_key);
    return phone_list;
}

function makeReasonMessage(phone, keyList){
   /* var pref_message = "Model Name : "+ phone_list[0]["fields"]["model_name"][0]+ "\n"
        + "Primary camera resolution : "+ phone_list[0]["fields"]["primary_camera_resolution"][0]+"  " +
        Mappings.getUnitKey("primary_camera_resolution") + "\n"
        + "Front camera resolution : "+ phone_list[0]["fields"]["front_camera_resolution"][0]+ "  " +
        Mappings.getUnitKey("front_camera_resolution") +"\n"
        + "Primary camera features : " + phone_list[0]["fields"]["primary_camera_features"][0] + "  " +
        Mappings.getUnitKey("primary_camera_features") +"\n"
        + "Video resolution : " +  phone_list[0]["fields"]["video_resolution"][0] + "  " +
        Mappings.getUnitKey("video_resolution") +"\n";*/

    var pref_message = "" ;
    for(var i=0;i<keyList.length;i++){
        var key = keyList[i];
        var skuKey =  Mappings.doesSKUKeyExists(key) ? Mappings.getSKUKey(key) : key ;
        pref_message +=  skuKey + " : " + phone["fields"][key][0] +" " + Mappings.getUnitKey(key) +" \n";
    }
    return pref_message;
}
function filterBrandPref(phone_list, source, sessionId,feature,number) {

    var localContext = lContext.userContext(sessionId);

    console.log(" ===============filter brand pref =================== ");
    console.log(localContext.sessionVars);
    console.log("LENGTH : ", phone_list.length);
    console.log(feature);
    var messages = [];
    if(phone_list.length == 0){
        messages.push({ type: "text", message: Messages.listMessage("notAvailable") });
        lContext.deleteKey(sessionId, "prev_list_query");
        lContext.deleteKey(sessionId, "prev_list");
        return messages;
    }

    for(var i=0;i<phone_list.length;i++){
        var id = phone_list[i]["_id"];
        var fields = phone_list[i]["fields"];
        fields["id"] = [id];
    }

   // console.log(phone_list[0]);
    var use_case_questions = Messages.hasUseCaseQuests(feature) ? Messages.getUseCaseQuestions(feature) : {};
    var use_case_preference_key_list = Object.keys(use_case_questions);
    var use_case_preference_key;
    var user_answer;
    var relevant_attribute;
    var pref_message;
    var reason_message;
    if(feature == "camera") {
        for (var k = 0; k < use_case_preference_key_list.length; k++) {
            use_case_preference_key = use_case_preference_key_list[k];
            user_answer =  localContext["sessionVars"][use_case_preference_key];
            var percentile;
            if(user_answer == "agree") percentile = 0.45;
            else if(user_answer == "neutral") percentile = 0.25;
            else percentile = 0.01;

            if(percentile != 0.01) {
                if (use_case_preference_key == "front_camera_pref") {
                    phone_list = filterPhonesBasedFeatureQuest(phone_list, sessionId,
                        "primary_camera_resolution", percentile, "greater",use_case_preference_key);
                }
                if (use_case_preference_key == "video_recording_pref") {
                    phone_list = filterPhonesBasedFeatureQuest(phone_list, sessionId,
                        "video_resolution", percentile, "greater",use_case_preference_key);
                }
                if (use_case_preference_key == "photo_storage_pref") {
                    phone_list = filterPhonesBasedFeatureQuest(phone_list, sessionId,
                        "internal_memory", percentile, "greater",use_case_preference_key);
                }
            }
        }
        phone_list = sortPhoneListByKey(phone_list,sessionId,"camera_score");
        var keyList = ["model_name","primary_camera_resolution","front_camera_resolution","primary_camera_features","video_resolution"];
        console.log("before maker reason message");
        pref_message = makeReasonMessage(phone_list[0],keyList);
        console.log("after making reason message");
        reason_message=" Camera list: \n List is sorted based on camera, camera expert reviews and also as per your" + " preferences  with " ;
        for(var k=0;k<use_case_preference_key_list.length;k++){
            var use_case_preference_key = use_case_preference_key_list[k];
            var key = use_case_preference_key + "_marked_value";
            if( use_case_preference_key == "front_camera_pref" && isKeyExists(key,localContext)){
                reason_message += " front camera resolution "+ localContext[key] ;
            }
            if( use_case_preference_key == "video_recording_pref" && isKeyExists(key,localContext)){
                reason_message += " video resolution > "+ localContext[key] + " and ";
            }
            if( use_case_preference_key == "photo_storage_pref" && isKeyExists(key,localContext)){
                reason_message += "phone storage > "+ localContext[key] + " ";
            }
        }
        reason_message += " in the given price range. ";
    }
    else if(feature == "performance"){
        for(var k=0;k<use_case_preference_key_list.length;k++){
            use_case_preference_key = use_case_preference_key_list[k];
            var user_answer_list = localContext["sessionVars"][use_case_preference_key];
            var percentile;
            if( use_case_preference_key == "gaming"){
                var max =  Math.max(user_answer_list);
                if(max == 0)percentile = 0.25;
                else if(max == 1)percentile = 0.50;
                else percentile = 0.01;
                console.log(" PERCENTILE  gaming ", percentile);
                if(percentile != 0.01)
                    phone_list = filterPhonesBasedFeatureQuest(phone_list,sessionId,"gpu_rank",percentile,"lesser", use_case_preference_key);
            }
            if( use_case_preference_key == "app_running"){
                var max =  Math.max(user_answer_list);
                console.log(" MAX VALUE",max);
                if(max == 0|| max == 1 || max == 2) percentile = 0.01;
                else if(max == 3) percentile = 0.30;
                else if(max == 4)percentile = 0.60;
                else percentile = 0.01;
                console.log(" PERCENTILE  app running ", percentile);
                if(percentile != 0.01)
                    phone_list = filterPhonesBasedFeatureQuest(phone_list,sessionId,"ram_memory",percentile,"greater", use_case_preference_key);
            }
            if( use_case_preference_key == "spend_time"){
                var max =  Math.max(user_answer_list);
                if(max == 0)percentile = 0.40;
                else if(max == 1 || max == 2)percentile = 0.20;
                else if(max == 3 || max == 4 || max == 5) percentile = 0.01;
                else percentile = 0.01;
                console.log(" PERCENTILE  spend time ", percentile);
                if(percentile != 0.01)
                    phone_list = filterPhonesBasedFeatureQuest(phone_list,sessionId,"battery_capacity",percentile, "greater",use_case_preference_key);
            }
        }
        phone_list = sortPhoneListByKey(phone_list,sessionId,"performance_score");
        keyList = ["model_name","processor_type","ram_memory","no_of_cores","processor_frequency","battery_capacity"];
        pref_message = makeReasonMessage(phone_list[0],keyList);
        reason_message=" Performance list: \n List is sorted based on expert performance reviews and " +
            "also as per your requirement with " ;
        for(var k=0;k<use_case_preference_key_list.length;k++){
            var use_case_preference_key = use_case_preference_key_list[k];
            var key = use_case_preference_key + "_marked_value";
            if( use_case_preference_key == "gaming" && isKeyExists(key,localContext)){
                reason_message += " best GPU,";
            }
            if( use_case_preference_key == "app_running" && isKeyExists(key,localContext)){
                reason_message += "RAM > "+ localContext[key] + " and ";
            }
            if( use_case_preference_key == "spend_time" && isKeyExists(key,localContext)){
                reason_message += "Battery capacity > "+ localContext[key] + " ";
            }
        }
        reason_message += " in the given price range. ";
    }
    else if( feature == "battery"){
        for(var k=0;k<use_case_preference_key_list.length;k++){
            use_case_preference_key = use_case_preference_key_list[k];
            var user_answer_list = localContext["sessionVars"][use_case_preference_key];
            var percentile;
            if( use_case_preference_key == "network_type"){
                var max =  Math.max(user_answer_list);
                if(max == 0)percentile = 0.40;
                else if(max == 1)percentile = 0.20;
                else percentile = 0.01;
                console.log(" PERCENTILE  STAND BY TIME ", percentile);
                if(percentile != 0.01) {
                    phone_list = filterPhonesBasedFeatureQuest(phone_list, sessionId, "stand_by_time", percentile, "greater", use_case_preference_key);
                }
            }
            if( use_case_preference_key == "spend_time_battery"){
                var max =  Math.max(user_answer_list);
                console.log(" MAX VALUE",max);
                if(max == 0) percentile = 0.40;
                else if(max == 1)percentile = 0.20;
                else if(max == 2)percentile = 0.15;
                else percentile = 0.01;
                console.log(" PERCENTILE  battery capacity ", percentile);
                if(percentile != 0.01) {
                    phone_list = filterPhonesBasedFeatureQuest(phone_list, sessionId, "battery_capacity", percentile, "greater", use_case_preference_key);
                }
            }
        }
        phone_list = sortPhoneListByKey(phone_list,sessionId,"battery_score");
        keyList = ["model_name","battery_type","ram_memory","stand_by_time","battery_capacity"];
        pref_message = makeReasonMessage(phone_list[0],keyList);
        reason_message=" Battery list:\n List is sorted based on expert performance and also as per your requirement with " ;
        for(var k=0;k<use_case_preference_key_list.length;k++){
            var use_case_preference_key = use_case_preference_key_list[k];
            var key = use_case_preference_key + "_marked_value";
            if( use_case_preference_key == "network_type" && isKeyExists(key,localContext)){
                reason_message += "standby time > "+ localContext[key] + " and ";
            }
            if( use_case_preference_key == "spend_time_battery" && isKeyExists(key,localContext)){
                reason_message += "battery capacity > "+ localContext[key] ;
            }
        }
        reason_message += " in the given price range. ";
    }
    else if ( feature == "display") {

        var display_type ;
        for(var k=0;k<use_case_preference_key_list.length;k++){
            use_case_preference_key = use_case_preference_key_list[k];
            var user_answer_list = localContext["sessionVars"][use_case_preference_key];
            var percentile;
            if( use_case_preference_key == "frequent_use_activity"){
                var max =  Math.max(user_answer_list);
                if(max == 0)percentile = 0.50;
                else if(max == 1)percentile = 0.45;
                else if(max == 2)percentile = 0.35;
                else if(max == 3)percentile = 0.25;
                else percentile = 0.01;
                console.log(" PERCENTILE  gaming ", percentile);
                if(percentile != 0.01) {
                    phone_list = filterPhonesBasedFeatureQuest(phone_list, sessionId, "screen_size", percentile, "greater", use_case_preference_key);
                    phone_list = filterPhonesBasedFeatureQuest(phone_list,sessionId,"video_resolution", percentile, "greater" ,use_case_preference_key);
                }
            }
            if( use_case_preference_key == "use_phone_light"){
                var max =  Math.max(user_answer_list);
                console.log(" MAX VALUE",max);
                if(max == 0){
                    phone_list = extractFieldsFromList(phone_list);
                    phone_list = phone_list.filter(function(phone){

                        var display_type = phone["display_type"][0];
                        display_type = display_type.toLowerCase().trim();
                        if(display_type.indexOf("ips") > -1)return true;
                        else if(display_type.indexOf("lcd") > -1)return true;
                        else return false;
                    });
                    phone_list =  addFieldsToList(phone_list);
                    display_type = "ips";
                }
                else if( max == 1){
                    phone_list = extractFieldsFromList(phone_list);
                    phone_list = phone_list.filter(function(phone){

                        var display_type = phone["display_type"][0];
                        display_type = display_type.toLowerCase().trim();
                        if(display_type.indexOf("oled") > -1)return true;
                        else if(display_type.indexOf("amoled") > -1)return true;
                        else if(display_type.indexOf("super amoled") > -1)return true;
                        else if(display_type.indexOf("retina") > -1)return true;
                        else return false;
                    });
                    phone_list =  addFieldsToList(phone_list)
                    display_type = "amoled";
                }
            }
        }
        phone_list = sortPhoneListByKey(phone_list,sessionId,"display_score");

        keyList = ["model_name","processor_type","ram_memory","gpu","no_of_cores","battery_capacity","ram_memory",];
        pref_message = makeReasonMessage(phone_list[0],keyList);
        reason_message=" Display list:\n List is sorted based on expert display review, display specs and also as per your " +
            "preferences with " ;
        for(var k=0;k<use_case_preference_key_list.length;k++){
            var use_case_preference_key = use_case_preference_key_list[k];
            var key = use_case_preference_key + "_marked_value";
            if( use_case_preference_key == "frequent_use_activity" && isKeyExists(key,localContext)){
                reason_message += " resolution >" + localContext[key]  ;
            }
        }
        reason_message += " in the given price range. ";
        if(display_type == "amoled")
            reason_message += "AMOLED screens will have deep blacks,vibrant colors and great battery life.";
        else if(display_type == "ips"){
            reason_message += "IPS screens will have bright whites,daylight readability and sharp text and images";
        }
    }
    else if( feature == "front camera resolution"){

        phone_list = sortPhoneListByKey(phone_list,sessionId,"camera_score");
        if(phone_list.length > 25)
            phone_list = phone_list.slice(0,25);

        for (var k = 0; k < use_case_preference_key_list.length; k++) {
            use_case_preference_key = use_case_preference_key_list[k];
            user_answer =  localContext["sessionVars"][use_case_preference_key];
            var percentile;
            if(use_case_preference_key == "record_videos"){

                if(user_answer == "agree")percentile = 0.40;
                else if( user_answer == "neutral") percentile = 0.20;
                else if( user_answer == "disagree") percentile = 0.01;
                else percentile = 0.01;
                console.log(" PERCENTILE record videos ");
                phone_list = filterPhonesBasedFeatureQuest(phone_list, sessionId, "video_resolution", percentile, "greater",use_case_preference_key);

            } else if( use_case_preference_key == "after_camera_important"){

                if(user_answer == "battery"){
                    phone_list = filterPhonesBasedFeatureQuest(phone_list, sessionId, "battery_score", 0.30, "greater", use_case_preference_key);
                } else if(user_answer == "performance"){
                    phone_list = filterPhonesBasedFeatureQuest(phone_list, sessionId, "performance_score", 0.30, "greater", use_case_preference_key);
                } else if(user_answer == "display"){
                    phone_list = filterPhonesBasedFeatureQuest(phone_list, sessionId, "display_score", 0.30, "greater", use_case_preference_key);
                }

            }
        }
        phone_list = sortPhoneListByKey(phone_list,sessionId,"front_camera_resolution");
        keyList = ["model_name","processor_type","gpu","ram_memory","no_of_cores","processor_frequency","battery_capacity"];
        pref_message = makeReasonMessage(phone_list[0],keyList);
        reason_message = "Selfie List:\n List is sorted based on front camera resolution, expert camera reviews and " +
            "also as per your preferences with " ;
        for(var k=0;k<use_case_preference_key_list.length;k++){
            var use_case_preference_key = use_case_preference_key_list[k];
            var key = use_case_preference_key + "_marked_value";
            if( use_case_preference_key == "frequent_use_activity" && isKeyExists(key,localContext)){
                reason_message += " screen size >" + localContext[key]  ;
            }
        }
        reason_message += " in the given price range. ";
        console.log(reason_message);
        console.log(pref_message);
    }
    else if(feature == "memory"){
        for(var k=0;k<use_case_preference_key_list.length;k++){
            use_case_preference_key = use_case_preference_key_list[k];
            var user_answer_list = localContext["sessionVars"][use_case_preference_key];
            var percentile;
            if( use_case_preference_key == "relevant_internal_memory"){
                var max =  Math.max(user_answer_list);
                if(max == 0 || max == 2 || max == 4) percentile = 0.45;
                else if(max == 1 || max == 3 || max == 5)percentile = 0.25;
                else percentile = 0.01;
                console.log(" PERCENTILE  relevant internal memory ", percentile);
                if(percentile != 0.01) {
                    phone_list = filterPhonesBasedFeatureQuest(phone_list, sessionId, "internal_memory", percentile, "greater", use_case_preference_key);
                }
            }
            if( use_case_preference_key == "micro_sd_card_cost"){
                var max =  Math.max(user_answer_list);
                console.log(" MAX VALUE",max);
                var user_external_memory;
                if(max == 0) user_external_memory = 8;
                else if(max == 1) user_external_memory = 16;
                else if(max == 2) user_external_memory = 32;
                else if(max == 3) user_external_memory = 64;
                else if(max == 4) user_external_memory = 128;
                else user_external_memory = 0;

                if(user_external_memory != 0) {
                    for (var m = 0; m < phone_list.length; m++) {
                        var external_memory = parseInt(phone_list[m]["fields"]["expandable_memory"][0]);
                        var internal_memory = parseInt(phone_list[m]["fields"]["internal_memory"][0]);
                        if (external_memory > user_external_memory)
                            external_memory = user_external_memory;
                        var temp_list = [external_memory + internal_memory];
                        phone_list[m]["fields"]["total_memory"] = temp_list;
                    }
                    phone_list = sortPhoneListByKey(phone_list, sessionId, "total_memory");
                }
            }
        }

        phone_list = sortPhoneListByKey(phone_list,sessionId,"performance_score");

        keyList = ["model_name","internal_memory","expandable_memory","ram_memory","micro_sd_slot"];
        pref_message = makeReasonMessage(phone_list[0],keyList);
        reason_message=" List is sorted based on sum of internal memory and external memory that " +
            "you are willing to buy and also as per" + " overall performance " ;
       /* for(var k=0;k<use_case_preference_key_list.length;k++){
            var use_case_preference_key = use_case_preference_key_list[k];
            var key = use_case_preference_key + "_marked_value";
            if( use_case_preference_key == "relevant_internal_memory" && isKeyExists(key,localContext)){
                reason_message += " internal memory >" + localContext[key]  ;
            }
        }
        reason_message += " in the given price range. ";
        */
    }
    else if(feature == "all"){
        phone_list = sortPhoneListByKey(phone_list,sessionId,"overall_score");
        keyList = ["model_name",'screen_size',"primary_camera_resolution","internal_memory","ram_memory"];
        pref_message = makeReasonMessage(phone_list[0],keyList);
        reason_message="List is sorted based on expert reviews and in the price range "
    }
    else if(feature == "phonelist_videos"){
        if(phone_list.length > 25)
            phone_list = phone_list.slice(0,25);
        phone_list = sortPhoneListByKey(phone_list,sessionId,"video_resolution");
        reason_message = Mappings.isReasonExists(feature) ? Mappings.getReasonMessage(feature) : "";
    }

    if(number == "one") {
        if(pref_message != null) {
            messages.push({type: "text", message: "We recommend you the below phone as per your preferences."});
            messages.push({type: "text", message: pref_message});
        }
        messages.push({type:"text",message: "Please scroll up to see more: "});
    }

    if(reason_message != null ) {
        messages.push({type: "text", message: reason_message});
    } else if( isKeyExists("list_reason_message",localContext)){
        reason_message = localContext["list_reason_message"];
        messages.push({type: "text", message: reason_message});
    }

    var id = [];
    for(var i=0;i<phone_list.length;i++){
        id.push(phone_list[i]["fields"]["id"][0]);
    }

    // console.log(id);
    lContext.storeNewKey(sessionId,"prev_total_list_ids",id);
    lContext.storeNewKey(sessionId, "prev_total_list", phone_list);
    lContext.storeNewKey(sessionId, "prev_list", "phone_list");


    phone_list = extractFieldsFromList(phone_list);

    relevant_attribute = Mappings.hasReleventAttriubte(feature) ? Mappings.getRelevantAttribute(feature) : [];

    messages.push({ type: "list", message: phone_list, relevant_attribute:relevant_attribute});

    console.log("filter brand pref completed");
    return messages
}

function printMessagesWhenPrevList(phone_list,sessionId,feature){

    var localContext =  lContext.userContext(sessionId);
    var messages = [];
    console.log("Running printMessagesWhenPrevList function");
    if(phone_list.length == 0){
        messages.push({ type: "text", message: Messages.listMessage("notAvailable") });
        lContext.deleteKey(sessionId, "prev_list_query");
        lContext.deleteKey(sessionId, "prev_list");
        return messages;
    }

    feature = feature.toLowerCase();

    phone_list = extractFieldsFromList(phone_list);
    console.log("Running printMessagesWhenPrevList function");

    // console.log(phone_list);
    var id_list = [];
    for(var i=0;i<phone_list.length;i++){
        var id = phone_list[i]["_id"];
        var fields = phone_list[i]["fields"];
        id_list.push(id);
    }

    console.log("Adding ids : ");
    console.log(id_list);
    console.log("Running printMessagesWhenPrevList function");
    lContext.storeNewKey(sessionId,"prev_total_list_ids",id_list);
    lContext.storeNewKey(sessionId, "prev_total_list", phone_list);
    lContext.storeNewKey(sessionId, "prev_list", "phone_list");


    var relevant_attribute = Mappings.hasReleventAttriubte(feature) ? Mappings.getRelevantAttribute(feature) : [];
    messages.push({ type: "list", message:phone_list,relevant_attribute :relevant_attribute });
    messages.push({type: "text", message: Messages.listMessage("scroll")});

    var reason_message = Mappings.isReasonExists(feature) ? Mappings.getReasonMessage(feature) : undefined;
    if(reason_message)
        messages.push({type:"text",message:reason_message});
    return messages;
}
function printMessagesWhenNoPrevList(phone_list,sessionId,source){

    console.log("print message when no prev list");
    var localContext = lContext.userContext(sessionId);
    var messages = [];

    if (phone_list.length > 0) {

        if(source == "fb"){

            var shown_phone_list = phone_list.slice(0, 7);
            lContext.storeNewKey(sessionId, "user_shown_list", shown_phone_list);
            var phone_names = "";
            for (var i = 0; i < shown_phone_list.length; i++)
                phone_names += i + 1 + ". " + shown_phone_list[i]["fields"]["model_name"][0] + "\n";
            messages.push({ type: "text", message: phone_names });
            messages.push({ type: "list", message: shown_phone_list });

        }
        else if( source == "android") {

            var list = [];
            for (var i = 0; i < phone_list.length; i++)
                list.push(phone_list[i]["fields"]);
            var relevant_attribute = localContext["relevant_attribute"];

            if(relevant_attribute == null || relevant_attribute == undefined)
                relevant_attribute = [];
            var feature = localContext.sessionVars.feature_pref.toLowerCase();
            if(feature == "camera") {
                relevant_attribute = [{"primary_camera_resolution": "CAMERA RESOLUTION"},
                    {"front_camera_resolution": " FRONT CAMERA RESOLUTION"},
                    {"video_resolution": " VIDEO RESOLUTION"},
                    {"internal_memory": " INTERNAL MEMORY"}];
                messages.push({type:"text",message: "We recommend you the below phone as per your preferences."});
                var pref_message = "Model Name : "+ list[0]["model_name"][0]+ "\n"
                    + "Primary camera resolution : "+ list[0]["primary_camera_resolution"][0]+"  " +
                            Mappings.getUnitKey("primary_camera_resolution") + "\n"
                    + "Front camera resolution : "+ list[0]["front_camera_resolution"][0]+ "  " +
                            Mappings.getUnitKey("front_camera_resolution") +"\n"
                    + "Primary camera features : " + list[0]["primary_camera_features"][0] + "  " +
                         Mappings.getUnitKey("primary_camera_features") +"\n"
                    + "Video resolution : " +  list[0]["video_resolution"][0] + "  " +
                        Mappings.getUnitKey("video_resolution") +"\n";
                messages.push({type:"text",message: pref_message});
                messages.push({type:"text",message: "Please scroll up to see more: "});

                var use_case_questions = Messages.useCaseQuestions[feature];
                var use_case_preference_key_list = Object.keys(use_case_questions);
                var reason_message="List is sorted based on camera, camera expert reviews and also as per your" +
                    " preferences  with " ;
                for(var k=0;k<use_case_preference_key_list.length;k++){
                    var use_case_preference_key = use_case_preference_key_list[k];
                    var key = use_case_preference_key + "_marked_value";
                    if( use_case_preference_key == "front_camera_pref" && isKeyExists(key,localContext)){
                        reason_message += " front camera resolution "+ localContext[key] ;
                    }
                    if( use_case_preference_key == "video_recording_pref" && isKeyExists(key,localContext)){
                        reason_message += " video resolution > "+ localContext[key] + " and ";
                    }
                    if( use_case_preference_key == "photo_storage_pref" && isKeyExists(key,localContext)){
                        reason_message += "phone storage > "+ localContext[key] + " ";
                    }
                }
                reason_message += " in the given price range. ";
                messages.push({type:"text",message: reason_message});
            }
            else if( feature == "performance"){
                relevant_attribute = [
                    {gpu : "GPU"},
                    {ram_memory: " RAM MEMORY"},
                    {processor_type : "PROCESSOR TYPE" },
                    {battery_capacity : "BATTERY CAPACITY"},
                    {processor_frequency : "PROCESSOR FREQUENCY"}];
                messages.push({type:"text",message: "We recommend you the below phone as per your preferences."});
                var pref_message = "Model Name: " + list[0]["model_name"][0]+ "\n"
                    + "Processor type: " + list[0]["processor_type"][0]+ "\n"
                    + "GPU type: " + list[0]["gpu"][0]+"\n"
                    + "RAM memory: " + list[0]["ram_memory"][0] +  "  " + Mappings.getUnitKey("ram_memory") +"\n"
                    + "No of cores: " + list[0]["no_of_cores"][0] + " " + Mappings.getUnitKey("no_of_cores") + "\n"
                    + "Processor frequency: " + list[0]["processor_frequency"][0]+  " "
                    + Mappings.getUnitKey("processor_frequency") +"\n"
                    + "Battery capacity: " + list[0]["battery_capacity"][0]+  " "
                    + Mappings.getUnitKey("battery_capacity") +"\n";
                messages.push({type:"text",message: pref_message});

                messages.push({type:"text",message: "Please scroll up to see more: "});

                var use_case_questions = Messages.useCaseQuestions[feature];
                var use_case_preference_key_list = Object.keys(use_case_questions);
                var reason_message="List is sorted based on expert performance and also as per your requirement with " ;
                for(var k=0;k<use_case_preference_key_list.length;k++){
                    var use_case_preference_key = use_case_preference_key_list[k];
                    var key = use_case_preference_key + "_marked_value";
                    if( use_case_preference_key == "gaming" && isKeyExists(key,localContext)){
                        reason_message += " best GPU,";
                    }
                    if( use_case_preference_key == "app_running" && isKeyExists(key,localContext)){
                        reason_message += "RAM > "+ localContext[key] + " and ";
                    }
                    if( use_case_preference_key == "spend_time" && isKeyExists(key,localContext)){
                        reason_message += "Battery capacity > "+ localContext[key] + " ";
                    }
                }
                reason_message += " in the given price range. ";
                messages.push({type:"text",message: reason_message});
            }
            else if( feature == "battery") {
                relevant_attribute = [
                    {battery_capacity : "BATTERY CAPACITY"},
                    {battery_type : "BATTERY TYPE"},
                    {non_removable_battery: " NON REMOVABLE BATTERY"},
                    {stand_by_time : "STANDBY TIME" } ];
                messages.push({type:"text",message: "We recommend you the below phone as per your preferences."});
                var pref_message = "Model Name: " + list[0]["model_name"][0]+ "\n"
                    + "Battery type: " + list[0]["battery_type"][0]+ "\n"
                    + "RAM memory: " + list[0]["ram_memory"][0] +  "  " + Mappings.getUnitKey("ram_memory") +"\n"
                    + "Standby time: " + list[0]["stand_by_time"][0] + " " + Mappings.getUnitKey("no_of_cores") + "\n"
                    + "Battery capacity: " + list[0]["battery_capacity"][0]+  " " + Mappings.getUnitKey("battery_capacity") +"\n";
                messages.push({type:"text",message: pref_message});

                messages.push({type:"text",message: "Please scroll up to see more: "});

                var use_case_questions = Messages.useCaseQuestions[feature];
                var use_case_preference_key_list = Object.keys(use_case_questions);
                var reason_message="List is sorted based on expert performance and also as per your requirement with " ;
                for(var k=0;k<use_case_preference_key_list.length;k++){
                    var use_case_preference_key = use_case_preference_key_list[k];
                    var key = use_case_preference_key + "_marked_value";
                    if( use_case_preference_key == "network_type" && isKeyExists(key,localContext)){
                        reason_message += "standby time > "+ localContext[key] + " and ";
                    }
                    if( use_case_preference_key == "spend_time_battery" && isKeyExists(key,localContext)){
                        reason_message += "battery capacity > "+ localContext[key] ;
                    }
                }

                reason_message += " in the given price range. ";
                messages.push({type:"text",message: reason_message});
            }
            else if( feature == "display"){
                relevant_attribute = [
                    {screen_size: "SCREEN SIZE"},
                    {display_resolution : "DISPLAY RESOLUTION"},
                    {display_type: " DISPLAY TYPE"},
                    {screen_pixel_density : "PPI" },
                    {battery_capacity : "BATTERY"},
                    {video_resolution : "VIDEO RESOLUTION"}];
                messages.push({type:"text",message: "We recommend you the below phone as per your preferences."});
                var pref_message = "Model Name: " + list[0]["model_name"][0]+ "\n"
                    + "Processor type: " + list[0]["processor_type"][0]+ "\n"
                    + "GPU type: " + list[0]["gpu"][0]+"\n"
                    + "RAM memory: " + list[0]["ram_memory"][0] +  "  " + Mappings.getUnitKey("ram_memory") +"\n"
                    + "No of cores: " + list[0]["no_of_cores"][0] + " " + Mappings.getUnitKey("no_of_cores") + "\n"
                    + "Processor frequency: " + list[0]["processor_frequency"][0]+  " "
                    + Mappings.getUnitKey("processor_frequency") +"\n"
                    + "Battery capacity: " + list[0]["battery_capacity"][0]+  " "
                    + Mappings.getUnitKey("battery_capacity") +"\n";
                messages.push({type:"text",message: pref_message});

                messages.push({type:"text",message: "Please scroll up to see more: "});

                var use_case_questions = Messages.useCaseQuestions[feature];
                var use_case_preference_key_list = Object.keys(use_case_questions);
                var reason_message="List is sorted based on expert display review, display specs and also as per your " +
                    "preferences with " ;
                for(var k=0;k<use_case_preference_key_list.length;k++){
                    var use_case_preference_key = use_case_preference_key_list[k];
                    var key = use_case_preference_key + "_marked_value";
                    if( use_case_preference_key == "frequent_use_activity" && isKeyExists(key,localContext)){
                        reason_message += " resolution >" + localContext[key]  ;
                    }
                    /*
                        if( use_case_preference_key == "use_phone_light" && isKeyExists(key,localContext)){
                            reason_message += "RAM > "+ localContext[key] ;
                        }
                    */
                }
                reason_message += " in the given price range. ";
                messages.push({type:"text",message: reason_message});
            }
            else if( feature == "front camera resolution"){
                relevant_attribute = [
                    {front_camera_resolution: "FRONT CAMERA RESOLUTION"},
                    {primary_camera_resolution : "PRIMARY CAMERA RESOLUTION"},
                    {video_resolution: " VIDEO RESOLUTION"},
                    {auto_focus : "AUTO FOCUS" },
                    {flash_type : "FLASH TYPE"},
                    {internal_memory : "INTERNAL MEMORY"}];
                messages.push({type:"text",message: "We recommend you the below phone as per your preferences."});
                var pref_message = "Model Name: " + list[0]["model_name"][0]+ "\n"
                    + "Processor type: " + list[0]["processor_type"][0]+ "\n"
                    + "GPU type: " + list[0]["gpu"][0]+"\n"
                    + "RAM memory: " + list[0]["ram_memory"][0] +  "  " + Mappings.getUnitKey("ram_memory") +"\n"
                    + "No of cores: " + list[0]["no_of_cores"][0] + " " + Mappings.getUnitKey("no_of_cores") + "\n"
                    + "Processor frequency: " + list[0]["processor_frequency"][0]+  " "
                    + Mappings.getUnitKey("processor_frequency") +"\n"
                    + "Battery capacity: " + list[0]["battery_capacity"][0]+  " "
                    + Mappings.getUnitKey("battery_capacity") +"\n";
                messages.push({type:"text",message: pref_message});

                messages.push({type:"text",message: "Please scroll up to see more: "});

                var use_case_questions = Messages.useCaseQuestions[feature];
                var use_case_preference_key_list = Object.keys(use_case_questions);
                var reason_message="List is sorted based on front camera resolution, expert camera reviews and " +
                    "also as per your preferences with " ;
                for(var k=0;k<use_case_preference_key_list.length;k++){
                    var use_case_preference_key = use_case_preference_key_list[k];
                    var key = use_case_preference_key + "_marked_value";
                    if( use_case_preference_key == "frequent_use_activity" && isKeyExists(key,localContext)){
                        reason_message += " screen size >" + localContext[key]  ;
                    }
                    /*
                     if( use_case_preference_key == "use_phone_light" && isKeyExists(key,localContext)){
                     reason_message += "RAM > "+ localContext[key] ;
                     }
                     */
                }
                reason_message += " in the given price range. ";
                messages.push({type:"text",message: reason_message});
            }
            else if( feature == "phonelist_videos"){

            }
            messages.push({ type: "list", message:list,relevant_attribute:relevant_attribute });
        }
        // if(isKeyExists("list_reason_message",localContext))
        //   messages.push({type:"text",message:localContext.list_reason_message});
        // messages.push({type: "text", message: Messages.listMessage("scroll")});
        lContext.deleteKey(sessionId,"list_reason_message");

    }
    else {
        messages.push({ type: "text", message: Messages.listMessage("notAvailable") });
        lContext.deleteKey(sessionId, "prev_list_query");
        lContext.deleteKey(sessionId, "prev_list");
    }
    return messages;
}
function processCombinedList(lists ,feature1,feature2,sessionId){

    var firstList  = lists[0];
    var secondList = lists[1];

    console.log( "first  list length : " + firstList.length);
    console.log( "second list length : " + secondList.length);

    for(var i=0;i<secondList.length;i++){
        var item_name = secondList[i]["model_name"][0];

        var found = false;
        for(var j=0;j < firstList.length;j++){
            var item_name2 = firstList[j]["model_name"][0];
            if(item_name == item_name2) {
                found = true;
                break;
            }
        }
        if(!found){
            firstList.push(secondList[i]);
        }
    }

    var feature_score1 = Mappings.getSpecScores(feature1);
    var feature_score2 = Mappings.getSpecScores(feature2);

    console.log(feature_score1 ,feature_score2);
    for(var i=0;i<firstList.length;i++){
        var item = firstList[i];
        var item_feature_score1 = parseInt(item[feature_score1][0]);
        var item_feature_score2 = parseInt(item[feature_score2][0]);
        var temp_list = [0.5 * item_feature_score1 + 0.5 * item_feature_score2];
        firstList[i]["combined_score"] = temp_list;
    }

    firstList = addFieldsToList(firstList);
//    printPhoneList(firstList,"model_name");
    firstList = sortPhoneListByKey(firstList,sessionId,"combined_score");

    firstList = extractFieldsFromList(firstList);
    console.log(" ============> after combined sort <==============  ");
  //  printPhoneList(firstList,"model_name");

    return firstList;

}
// data processing functions
function getFieldsFromDB(fields, model_names, cb) {

    var query_data = model_names.join(" ");
    Search.getValue(fields, query_data, function (data) {
        var result_list = [];
        var list = data.hits.hits;
        for (var i = 0; i < list.length; i++) {
            var model = list[i]["fields"]["model_name"][0];
            if (model_names.indexOf(model) > -1) result_list.push(list[i]["fields"]);
        }
        cb(result_list);
    });
}
function getAttributeValueFromDB(field_name, model_name, cb) {

    var fields = [field_name,"model_name"];
    console.log("Start of getAttributeValueFromDB function");
    Search.getValue(fields, model_name, function (data) {
        var result = "";
        var list = data.hits.hits;
        for (var i = 0; i < list.length; i++) {
            var model = list[i]["fields"]["model_name"][0];
            if(model == model_name) {
                try {
                    result = list[i]["fields"][field_name][0];
                    break;
                }catch(error){
                }
            }
        }
        cb(result);
    });
}

function betterMobiles(map_key, model_names, cb) {
    var fields = ["model_name"];
    var messages = [];
    if (map_key != "better") {
        var spec_score = Mappings.hasSpecScores(map_key) ? Mappings.getSpecScores(map_key) : undefined;
        if (spec_score == undefined) {
            messages.push({ type: "text", message: Messages.listMessage("noInfo") });
            cb(messages);
            return;
        }
        fields.push(spec_score);
    } else fields = fields.concat(Mappings.getFieldsAttribute("better"));
    var query_data = model_names.join(" ");
    Search.getValue(fields, query_data, function (data) {
        var result_list = [];
        var list = data.hits.hits;
        for (var i = 0; i < list.length; i++) {
            var model = list[i]["fields"]["model_name"][0];
            if (model_names.indexOf(model) > -1) result_list.push(list[i]["fields"]);
        }
        var output_common;

        if (map_key != "better") {
            //attribute and feature
            var spec_key = fields[1].toString();
            var value1 = parseFloat(result_list[0][spec_key]);
            var value2 = parseFloat(result_list[1][spec_key]);
            if (value1 > value2) {
                output_common = result_list[0]["model_name"] + " is better than " + result_list[1]["model_name"] + " in " + map_key;
            }
            else if (value1 < value2) {
                output_common = result_list[1]["model_name"] + " is better than " + result_list[0]["model_name"] + " in " + map_key;
            }
            else output_common = result_list[1]["model_name"] + " is equal to " + result_list[0]["model_name"] + " in " + map_key;

            messages.push({ type: "text", message: output_common });
            cb(messages);
            return;
        }

        var output_sku1 = result_list[0]["model_name"] + ": \n";
        var output_sku2 = result_list[1]["model_name"] + ": \n";;

        var key_list = fields;
        var sku1_spec_score = 0;
        var sku2_spec_score = 0;
        var sku1_feature_score = 0;
        var sku2_feature_score = 0;
        for (var i = 0; i < key_list.length; i++) {
            var key = key_list[i];

            if (key == 'model_name') {
                continue;
            }
            if (key == "overall_score") {
                if (result_list[0]["overall_score"] > result_list[1]["overall_score"]) sku1_spec_score += 1;
                else sku2_spec_score += 1;
                continue;
            }

            var original_key = Mappings.doesSKUKeyExists(key) ? Mappings.getSKUKey(key) : undefined;
            var unit_key = Mappings.getUnitKey(key);
            // if true first one is better
            var value = findBetterAttribute(result_list, key);
            if (value == 1) {
                //sku1 is added with +
                sku1_feature_score += 1;
                output_sku1 += " + " + original_key + ": " + result_list[0][key] + " " + unit_key +"\n";
                output_sku2 += " - " + original_key + ": " + result_list[1][key] + " " + unit_key +"\n";
            } else if (value == 2) {
                sku2_feature_score += 1;
                output_sku1 += " - " + original_key + ": " + result_list[0][key] + " " + unit_key +"\n";
                output_sku2 += " + " + original_key + ": " + result_list[1][key] + " " + unit_key +"\n";
            } else {
                output_sku1 += " . " + original_key + ": " + result_list[0][key] + " " + unit_key +"\n";
                output_sku2 += " . " + original_key + ": " + result_list[1][key] + " " + unit_key +"\n";
            }
        }
        if (sku1_feature_score > sku2_feature_score || (sku1_feature_score == sku2_feature_score && sku1_spec_score > sku2_spec_score))
            output_common = result_list[0]["model_name"] + " is better than " + result_list[1]["model_name"];
        else output_common = result_list[1]["model_name"] + " is better than " + result_list[0]["model_name"];

        messages.push({ type: "text", message: output_common });
        messages.push({ type: "text", message: output_sku1 });
        messages.push({ type: "text", message: output_sku2 });

        cb(messages);
    });
}

// sentiment analysis code
var objects = {};
function check(keyword, attribute) {
    var keyword_text = keyword.text.toLowerCase();
    if (attribute == "phone") {
        if ((keyword_text.indexOf(attribute) > -1 || keyword_text.indexOf("mobile") > -1 || keyword_text.indexOf("handset") > -1) && keyword_text.indexOf("battery") == -1 && keyword_text.indexOf("camera") == -1 && keyword_text.indexOf("display") == -1 && keyword_text.indexOf("performance") == -1) {
            return 1;
        } else {
            return 0;
        }
    }
    if (attribute == "performance") {
        if (keyword_text.indexOf(attribute) > -1 && keyword_text.indexOf("camera") == -1 && keyword_text.indexOf("battery") == -1 && keyword_text.indexOf("display") == -1) {
            return 1;
        } else {
            return 0;
        }
    } else {
        if (keyword_text.indexOf(attribute) > -1) {
            return 1;
        } else {
            return 0;
        }
    }
}
function final_result(attr, attribute, positive, negitive, pscore, nscore) {
    //local variable
    var p = 0,
        p1 = 0,
        n = 0,
        n1 = 0;

    if (positive.length > 0) {
        var p_max = parseFloat(0);
        var p1_max = parseFloat(0);
        var p_res = "";
        var p1_res = "";
        var pl = positive.length;
        for (var i = 0; i < pl; i++) {
            if (parseFloat(pscore[i]) < 0.5) {
                p++;
                if (parseFloat(pscore[i]) > p_max) {
                    p_max = parseFloat(pscore[i]);
                    p_res = positive[i];
                }
            } else {
                p1++;
                if (parseFloat(pscore[i]) > p1_max) {
                    p1_max = parseFloat(pscore[i]);
                    p1_res = positive[i];
                }
            }
        }
    }
    //to split negitive array into two arrays based on camera score <-0.5 >-0.5
    if (negitive.length > 0) {
        var n_max = parseFloat(0);
        var n1_max = parseFloat(0);
        var n_res = "";
        var n1_res = "";
        var nl = negitive.length;
        for (i = 0; i < nl; i++) {
            if (parseFloat(nscore[i]) < -0.5) {
                n++;
                if (parseFloat(nscore[i]) < n_max) {
                    n_max = parseFloat(nscore[i]);
                    n_res = negitive[i];
                }
            } else {
                n1++;
                if (parseFloat(nscore[i]) < n1_max) {
                    n1_max = parseFloat(nscore[i]);
                    n1_res = negitive[i];
                }
            }
        }
    }

    //to check weather positive are exist or not
    if (positive.length > 0) {
        //console.log("positive::::::::::::::::::::::::::;")
        if (p > 0 && p1 > 0) {
            attribute.positive.push(p_res + "(" + p + ")");
            attribute.positive.push(p1_res + "(" + p1 + ")");
            //console.log(p_res+"("+p+")");
            //console.log(p1_res+"("+p1+")");
        } else if (p > 0 && p1 == 0) {
            attribute.positive.push(p_res + "(" + p + ")");
            //console.log(p_res+"("+p+")");
        } else if (p == 0 && p1 > 0) {
            attribute.positive.push(p1_res + "(" + p1 + ")");
            //console.log(p1_res+"("+p1+")");
        }
    }
    //to check negives are exist or not
    if (negitive.length > 0) {
        //console.log("negative::::::::::::::::::::::::::::")
        if (n > 0 && n1 > 0) {
            attribute.negitive.push(n_res + "(" + n + ")");
            attribute.negitive.push(n1_res + "(" + n1 + ")");

            //console.log(n_res+"("+n+")");
            //console.log(n1_res+"("+n1+")");
        } else if (n == 0 && n1 > 0) {
            attribute.negitive.push(n1_res + "(" + n1 + ")");

            //console.log(n1_res+"("+n1+")");
        } else if (n1 == 0 && n > 0) {
            attribute.negitive.push(n_res + "(" + n + ")");

            //console.log(n_res+"("+n+")");
        }
    }
    if (attr == "phone") {
        objects["phone"] = attribute;
    }
    if (attr == "battery") {
        objects["battery"] = attribute;
    } else if (attr == "camera") {
        objects["camera"] = attribute;
    } else if (attr == "performance") {
        objects["performance"] = attribute;
    } else if (attr == "display") {
        objects["display"] = attribute;
    } else {
        //console.log(attribute)
        objects["other"] = attribute;
    }
    //console.log(attribute);
}
function getSentiment(keywords) {
    /*phone,battery,camera,display,performance,other*/
    var positive_a = [[], [], [], [], [], []];
    var negitive_a = [[], [], [], [], [], []];
    var pscore_a = [[], [], [], [], [], []];
    var nscore_a = [[], [], [], [], [], []];

    var len_result = keywords.length;
    var phone_att = "phone";
    var battery_att = "battery";
    var camera_att = "camera";
    var display_att = "display";
    var performance_att = "performance";
    for (var i = 0; i < len_result; i++) {
        //to pass each keyword into correct array
        if (keywords[i].sentiment.type == "positive") {
            if (check(keywords[i], phone_att)) {
                positive_a[0].push(keywords[i].text);
                pscore_a[0].push(parseFloat(keywords[i].sentiment.score));
            } else if (check(keywords[i], battery_att)) {
                positive_a[1].push(keywords[i].text);
                pscore_a[1].push(parseFloat(keywords[i].sentiment.score));
            } else if (check(keywords[i], camera_att)) {
                positive_a[2].push(keywords[i].text);
                pscore_a[2].push(parseFloat(keywords[i].sentiment.score));
            } else if (check(keywords[i], display_att)) {
                positive_a[3].push(keywords[i].text);
                pscore_a[3].push(parseFloat(keywords[i].sentiment.score));
            } else if (check(keywords[i], performance_att)) {
                positive_a[4].push(keywords[i].text);
                pscore_a[4].push(parseFloat(keywords[i].sentiment.score));
            } else {
                positive_a[5].push(keywords[i].text);
                pscore_a[5].push(parseFloat(keywords[i].sentiment.score));
            }
        } else if (keywords[i].sentiment.type == "negative") {
            if (check(keywords[i], phone_att)) {
                negitive_a[0].push(keywords[i].text);
                nscore_a[0].push(parseFloat(keywords[i].sentiment.score));
            } else if (check(keywords[i], battery_att)) {
                negitive_a[1].push(keywords[i].text);
                nscore_a[1].push(parseFloat(keywords[i].sentiment.score));
            } else if (check(keywords[i], camera_att)) {
                negitive_a[2].push(keywords[i].text);
                nscore_a[2].push(parseFloat(keywords[i].sentiment.score));
            } else if (check(keywords[i], display_att)) {
                negitive_a[3].push(keywords[i].text);
                nscore_a[3].push(parseFloat(keywords[i].sentiment.score));
            } else if (check(keywords[i], performance_att)) {
                negitive_a[4].push(keywords[i].text);
                nscore_a[4].push(parseFloat(keywords[i].sentiment.score));
            } else {
                negitive_a[5].push(keywords[i].text);
                nscore_a[5].push(parseFloat(keywords[i].sentiment.score));
            }
        }
    }

    var phone = {
        positive: [],
        negitive: []

    };
    var camera = {
        positive: [],
        negitive: []
    };

    var battery = {
        positive: [],
        negitive: []

    };

    var performance = {
        positive: [],
        negitive: []

    };

    var display = {
        positive: [],
        negitive: []

    };
    var other = {
        positive: [],
        negitive: []
    };
    //console.log(negitive_a[5]);
    //to fill all attribute positive and negitves into object
    final_result("phone", phone, positive_a[0], negitive_a[0], pscore_a[0], nscore_a[0]);
    final_result("battery", battery, positive_a[1], negitive_a[1], pscore_a[1], nscore_a[1]);
    final_result("camera", camera, positive_a[2], negitive_a[2], pscore_a[2], nscore_a[2]);
    final_result("display", display, positive_a[3], negitive_a[3], pscore_a[3], nscore_a[3]);
    final_result("performance", performance, positive_a[4], negitive_a[4], pscore_a[4], nscore_a[4]);
    final_result("other", other, positive_a[5], negitive_a[5], pscore_a[5], nscore_a[5]);
    return objects;
}
function getSentimentObject(name, obj) {
    var output = "";
    if (obj.positive.length > 0) {
        output = name + " positives  \n";
        for (var i in obj.positive) output += "\t" + obj["positive"][i] + "\n";
    }
    if (obj.negitive.length > 0) {
        output += name + " negatives  \n";
        for (var i in obj.negitive) output += "\t" + obj["negitive"][i] + "\n";
    }
    return output;
}
function separateSentiment(data) {
    var output = "";
    output += getSentimentObject("Phone", data["phone"]) + "\n";
    output += getSentimentObject("Battery", data["battery"]) + "\n";
    output += getSentimentObject("Camera", data["camera"]) + "\n";
    // output  += getSentimentObject("other",data["other"],output);
    return output;
}

function printEntityListFromWit(entities) {
    console.log("-----------Entities from wit---------------")
    for(var key in entities) {
        var values_array = entities[key];
        var value_string = "";
        for(var i in values_array) {
            value_string += " " + values_array[i].value;
        }
        console.log(key + " : " + value_string);
    }
    console.log("--------------------------------------------")
}

module.exports = {
    isKeyExists: isKeyExists,
    makeListFBFormat: makeListFBFormat,
    definePriceRange: definePriceRange,
    storeValInContext: storeValInContext,
    checkEntities: checkEntities,
    getSentiment: getSentiment,
    sort_by: sort_by,
    separateSentiment: separateSentiment,
    extractFieldsFromList: extractFieldsFromList,
    addFieldsToList: addFieldsToList,
    getSKUAlias: getSKUAlias,
    findAllPhonesHelper: findAllPhonesHelper,
    filterBrandPref: filterBrandPref,
    specMessage: featurePrefMessage,
    jsonConcat: jsonConcat,
    betterMobiles: betterMobiles,
    addPrevQuery: addPrevQuery,
    storePrevQuery: storePrevQuery,
    getAttributeValueFromDB: getAttributeValueFromDB,
    breakMessagesForFacebook:breakMessagesForFacebook,
    getFieldsFromDB:getFieldsFromDB,
    separateKeyValueSKU:separateKeyValueSKU,
    addDirectEntitiesToContext:addDirectEntitiesToContext,
    firstEntityValue: firstEntityValue,
    allEntityValue: allEntityValue,
    printEntityListFromWit:printEntityListFromWit,
    printMessagesWhenPrevList:printMessagesWhenPrevList,
    processCombinedList:processCombinedList
};

//# sourceMappingURL=helper-compiled.js.map