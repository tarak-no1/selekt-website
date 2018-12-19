'use strict';

// Weather Example
// See https://wit.ai/sungkim/weather/stories and https://wit.ai/docs/quickstart
//const Wit = require('node-wit').Wit;

const FB = require('./facebook.js');
const Config = require('./../config/const.js');
const Search = require('./logics.js');
const lContext = require('./localContexts.js');
const Sessions = require('./sessions.js');
var http = require('http');
var Semantics = require('../semantics/check.js');
const Messages = require('./messages.js');
const witRequest = require('./request.js');
// const mongoDB = require('./mongodb/update_mongo.js');
var watson = require('watson-developer-cloud');
const Helper = require('./helper.js');
const Mappings = require('./mapping.js');
const functions = require('./functions.js');
var async = require('async');
var winston = require('winston');
const witAPIs = require('./witAPIS.js');
const global = require('./global.js');
const db = require('./pushintodb.js');
var moment = require('moment');

function getAllEntities(sessionId, context, entities, message, callback) {

    // Store entities in context

    var localContext = lContext.userContext(sessionId);

    Helper.printEntityListFromWit(entities);
    context = Helper.storeValInContext(context, "entity_list", entities, sessionId);
    context = Helper.addDirectEntitiesToContext(context, entities, sessionId);

    var features = Helper.firstEntityValue(entities, "features");
    if (features && context.mobile) lContext.storeNewSessionKey(sessionId, "feature_pref", [features]);
    if (features) context = Helper.storeValInContext(context, "features", features, sessionId);

    var intent = Helper.firstEntityValue(entities, "intent");
    //  if(intent && context.mobile)
    //    lContext.storeNewSessionKey(sessionId,"feature_pref",[intent]);

    if (intent) context = Helper.storeValInContext(context, "intent", intent, sessionId);

    if (context.attribute) {
        var attribute_list = Helper.allEntityValue(entities, 'attribute');
        context = Helper.storeValInContext(context, "attribute_list", attribute_list, sessionId);
    }

    var query = Helper.firstEntityValue(entities, "query");
    if (query) {
        if (query == "what") context = Helper.storeValInContext(context, "what", "what", sessionId);
        if (query == "why") context = Helper.storeValInContext(context, "why", "why", sessionId);
        if (query == "how") context = Helper.storeValInContext(context, "how", "how", sessionId);
        if (query == "does") context = Helper.storeValInContext(context, "does", "does", sessionId);
    }

    if (context.units) {
        if (context.attribute) context = Helper.storeValInContext(context, "attribute", context.attribute, sessionId);
        if (context.price_range) context = Helper.storeValInContext(context, "attribute_filter", context.price_range, sessionId);else context = Helper.storeValInContext(context, "attribute_filter", "above", sessionId);
    }

    context = Helper.definePriceRange(message, context, sessionId);

    var in_list = Helper.firstEntityValue(entities, "list_entity");
    var yes_no = Helper.firstEntityValue(entities, "yes_no");
    if (yes_no) context = Helper.storeValInContext(context, "yes_no", yes_no, sessionId);

    var brand = Helper.firstEntityValue(entities, "brand");
    if (brand) {
        context = Helper.storeValInContext(context, "brand", brand, sessionId);
        if (!Helper.isKeyExists("brand_pref", localContext.sessionVars)) lContext.storeNewSessionKey(sessionId, "brand_pref", []);
    }

    if (context.clear) {
        context = {};
        context = Helper.storeValInContext(context, "clear", context.clear, sessionId);
    }
    if (context.intent == "trivia") {
        context = {};
        context = Helper.storeValInContext(context, "trivia", message, sessionId);
    }

    console.log("--------------generated context--------------------");
    console.log(context);
    console.log("---------------------------------------------------");

    message = message.toLowerCase();
    Helper.getSKUAlias(message, function (data) {
        var skuList = data["skus"];
        var aliasList = data['aliases'];
        if ((Helper.isKeyExists("compare", context) || Helper.isKeyExists("better", context)) && skuList.length >= 2) {
            context = Helper.storeValInContext(context, "sku1", skuList[0], sessionId);
            context = Helper.storeValInContext(context, "sku2", skuList[1], sessionId);
            delete context.sku;
            for (var j in aliasList) message = message.replace(aliasList[j], "");
        } else if (skuList.length != 0) {
            context = Helper.storeValInContext(context, "sku", skuList[0], sessionId);
        }

        for (var i in Mappings.noNoWords) {
            var nonoword = Mappings.noNoWords[i];
            if (wordInString(message, nonoword)) {
                context = {};
                context = Helper.storeValInContext(context, "complex_sentence", nonoword, sessionId);
                break;
            }
        }

        for (var i in Mappings.noNoWordOr) {
            var nonoword = Mappings.noNoWordOr[i];
            if (wordInString(message, nonoword)) {
                if (!(Helper.isKeyExists("sku1", context) && Helper.isKeyExists("sku2", context))) {
                    context = {};
                    context = Helper.storeValInContext(context, "complex_sentence", nonoword, sessionId);
                    break;
                }
            }
        }

        for (var i in Mappings.noNoWordNo) {
            var nonoword = Mappings.noNoWordNo[i];
            if (wordInString(message, nonoword)) {
                if (message.toLowerCase() != "no" && message.toLowerCase() != "n") {
                    context = {};
                    context = Helper.storeValInContext(context, "complex_sentence", nonoword, sessionId);
                    break;
                }
            }
        }

        // var nonoword;
        // if (Mappings.noNoWordOr.some(function(v) {
        //         if(message.indexOf(v) > -1) nonoword = v;
        //         return message.indexOf(" " + v + " ") >= 0; })) {
        //     console.log("Banned word is in the function");
        //     if(!(Helper.isKeyExists("sku1",context) && Helper.isKeyExists("sku2",context))) {
        //         context = {};
        //         context = Helper.storeValInContext(context,"complex_sentence",nonoword,sessionId,true);
        //     }
        // }
        // if (Mappings.noNoWordNo.some(function(v) {
        //         if(message.indexOf(v) > -1) nonoword = v;
        //         return message.indexOf(" " + v + " ") >= 0; })) {
        //     console.log("Banned word is in the function");
        //     if(message.toLowerCase() != "no" || message.toLowerCase() != "n") {
        //         context = {};
        //         context = Helper.storeValInContext(context,"complex_sentence",nonoword,sessionId,true);
        //     }
        // }
        // if (Mappings.noNoWords.some(function(v) {
        //         if(message.indexOf(v) > -1) nonoword = v;
        //         return message.indexOf(" " + v + " ") >= 0; })) {
        //     context = {};
        //     context = Helper.storeValInContext(context,"complex_sentence",nonoword,sessionId,true);
        // }

        if (!Helper.isKeyExists('clear', context) && !Helper.isKeyExists('profanity', context)) {
            Helper.checkEntities(message, context, sessionId, entities, function (data) {
                callback && callback(data);
            });
        } else {
            callback && callback(context);
        }
    });
}

// Bot actions
const actions = {

    say(sessionId, context, messages) {

        // Bot testing mode, run cb() and return
        if (require.main === module) {
            // cb();
            return;
        }
        const recipientId = Sessions.findFBid(sessionId);
        var localContext = lContext.userContext(sessionId);

        if (recipientId && localContext !== undefined) {

            messages = Helper.breakMessagesForFacebook(messages, '\n');
            messages = Helper.breakMessagesForFacebook(messages, '.');

            async.eachSeries(messages, function (listItem, esNext) {
                if (listItem["type"] === "text") {
                    FB.fbMessage(recipientId, listItem["message"], function (data) {
                        esNext();
                    });
                } else if (listItem["type"] === "list") {
                    FB.fbGenericMessage(recipientId, listItem["message"], function (data) {
                        esNext();
                    });
                }
            });
        }
    },
    merge(sessionId, context, entities, message, cb) {
        // Retrieve the location entity and store it into a context field

        var localContext = lContext.userContext(sessionId);
        var fbId = Sessions.findFBid(sessionId);
        lContext.storeNewKey(sessionId, "user_message", message);

        getAllEntities(sessionId, context, entities, message, function (context) {

            console.log("-----------------entities_and_values context--------------------");
            console.log(context);
            console.log("--------------------------------------------------");

            var functionName = functions.getFunctionName(context);
            console.log("Running function : " + functionName);
            if (functionName != null) {
                lContext.storeNewKey(sessionId, "preFunction", functionName);
                lContext.storeNewKey(sessionId, "prev_user_question", context);
            }

            var final_context_function = {};
            final_context_function["final_context"] = context;
            final_context_function["bot_function"] = functionName;
            cb(final_context_function);
        });
    },
    error(sessionId, context, error) {
        console.log(error.message);
        context.error = "error";
    },

    // lists main list , male and female phones list, similar
    // phones and sort phone list.

    ['findAllPhones'](sessionId, context, source, cb) {

        var localContext = lContext.userContext(sessionId);
        var spec_sort = {};
        var spec_query = {};
        var filter = {};
        var query;
        var list_reason_message;
        var attribute_mapped;
        var filter_list = [];
        lContext.storeNewKey(sessionId, "relevant_attribute", []);
        var featureList = [];
        if (Helper.isKeyExists("feature_pref", localContext.sessionVars)) featureList = localContext.sessionVars.feature_pref;

        if (Helper.isKeyExists('intent', context)) {
            var key = context.intent.toLowerCase();
            console.log(" intent selection", key);
            var feature_pref_mapped = [];
            if (key == "phonelist_camera") feature_pref_mapped.push("camera");else if (key == "phonelist_battery") feature_pref_mapped.push("battery");else if (key == "phonelist_memory") feature_pref_mapped.push("memory");else if (key == "phonelist_perform") feature_pref_mapped.push("performance");else if (key == "phonelist_front_camera") feature_pref_mapped.push("front camera resolution");
            console.log(feature_pref_mapped);
            if (feature_pref_mapped.length > 0) {
                delete context.intent;
                lContext.storeNewSessionKey(sessionId, "feature_pref", feature_pref_mapped);
            }
            if (featureList.length == 0) {
                spec_sort = Mappings.isSpecSortKeyExists(key) ? Mappings.specSortValue(key) : undefined;
                list_reason_message = Mappings.isReasonExists(key) ? Mappings.getReasonMessage(key) : undefined;
            }
        }

        if (Helper.isKeyExists("start_price", localContext.sessionVars) && Helper.isKeyExists("end_price", localContext.sessionVars)) {
            filter = {
                'range': {
                    'price': {
                        'gte': localContext.sessionVars.start_price,
                        'lte': localContext.sessionVars.end_price
                    }
                }
            };
        }

        if (Helper.isKeyExists("popular", context)) {
            console.log("popular phone");
            spec_sort = Mappings.specSortValue("popular");
            query = { bool: { "must_not": [{ "match": { "popular": 0 } }] } };
            output = Helper.addPrevQuery(sessionId, query, {}, spec_query, filter);
            spec_query = output["query"];
            filter = output["filter"];
        }

        if (Helper.isKeyExists("brand", context)) {
            console.log("brand phones");
            query = { bool: { "must": [{ "match": { "brand": context.brand } }] } };
            output = Helper.addPrevQuery(sessionId, query, {}, spec_query, filter);
            spec_query = output["query"];
            filter = output["filter"];
        }

        if (Helper.isKeyExists("os", context)) {
            console.log("best os phone");
            spec_sort = Mappings.specSortValue("os");
            query = { bool: { "must": [{ "match": { "os": context.os } }] } };
            output = Helper.addPrevQuery(sessionId, query, {}, spec_query, filter);
            spec_query = output["query"];
            filter = output["filter"];
        }

        if (Helper.isKeyExists("sim_type", context)) {
            console.log("sim type phone");
            query = { bool: { "must": [{ "match": { "sim_type": context.sim_type } }] } };
            output = Helper.addPrevQuery(sessionId, query, {}, spec_query, filter);
            spec_query = output["query"];
            filter = output["filter"];
        }

        if (Helper.isKeyExists("network_support", context)) {
            console.log("network support phone");
            query = { bool: { "must": [{ "match": { "network_support": context.network_support } }] } };
            output = Helper.addPrevQuery(sessionId, query, {}, spec_query, filter);
            spec_query = output["query"];
            filter = output["filter"];
        }

        if (Helper.isKeyExists("processor_type", context)) {
            console.log("processor type  phones");
            query = { bool: { "must": [{ "match_phrase": { "processor_type": context.processor_type } }] } };
            output = Helper.addPrevQuery(sessionId, query, {}, spec_query, filter);
            spec_query = output["query"];
            filter = output["filter"];
        }

        if (Helper.isKeyExists("display_type", context)) {
            console.log("display type phones");
            query = { bool: { "must": [{ "match_phrase": { "display_type": context.display_type } }] } };
            output = Helper.addPrevQuery(sessionId, query, {}, spec_query, filter);
            spec_query = output["query"];
            filter = output["filter"];
        }

        if (Helper.isKeyExists("sensor_type", context)) {
            console.log("sensor type  phones");
            query = { bool: { "must": [{ "match_phrase": { "sensors": context.sensor_type } }] } };
            output = Helper.addPrevQuery(sessionId, query, {}, spec_query, filter);
            spec_query = output["query"];
            filter = output["filter"];
        }

        if (Helper.isKeyExists('phone_properties', context)) {
            console.log("phone property  phones");
            var key = context.phone_properties.toLowerCase();
            spec_sort = Mappings.isSpecSortKeyExists(key) ? Mappings.specSortValue(key) : undefined;
            list_reason_message = Mappings.isReasonExists(key) ? Mappings.getReasonMessage(key) : undefined;
        }

        if (Helper.isKeyExists("past_release", context)) {
            var dates = Mappings.getPastTime(context.past_release);
            filter = { "and": [{
                    "range": {
                        "announced_date": { "gte": dates.start_time,
                            "lte": dates.end_time }
                    }
                }, {
                    "range": {
                        "price": { "gte": localContext.sessionVars.start_price,
                            "lte": localContext.sessionVars.end_price }
                    }
                }]
            };
            output = Helper.addPrevQuery(sessionId, {}, filter, spec_query, filter);

            spec_query = output["query"];
            filter = output["filter"];
        }

        if (Helper.isKeyExists('attribute', context)) {
            var attribute_list = context.attribute_list;
            for (var i in attribute_list) {
                var attribute = attribute_list[i];
                var filter_obj = {};
                var attribute_preposition = null;
                var attribute_quantity = null;
                var attribute_values = Helper.allEntityValue(context.entity_list, attribute);
                console.log(attribute);
                console.log(context.entity_list);
                console.log("Attribute values");
                console.log(attribute_values);

                attribute_mapped = Mappings.isDbKeyExists(attribute.toLowerCase()) ? Mappings.getDbKey(attribute.toLowerCase()) : undefined;

                // Extract if attribute values exist in entities
                for (var j in attribute_values) {
                    var value = attribute_values[j];
                    if (['above', 'below', 'under', 'equal', 'between', 'any'].indexOf(value) > -1) {
                        attribute_preposition = value;
                    } else if (!isNaN(value)) {
                        attribute_quantity = parseInt(value, 10);
                    }
                }

                // If attribute value filter exists
                if (attribute_quantity != null) {
                    if (attribute_preposition == "above" || attribute_preposition == "equal" || attribute_preposition == null) filter_obj[attribute_mapped] = { gte: attribute_quantity };else if (attribute_preposition == "under") filter_obj[attribute_mapped] = { gte: 0, lte: attribute_quantity };
                    console.log("Adding filter : " + JSON.stringify(filter_obj, null, 2));
                    filter_list.push({ 'range': filter_obj });

                    var filter_attribute = {};
                    filter_attribute["and"] = filter_list;

                    output = Helper.addPrevQuery(sessionId, {}, filter_attribute, spec_query, filter);

                    spec_query = output["query"];
                    filter = output["filter"];
                    console.log("attribute filter completed.");
                } else {
                    console.log("best attribute phone", context.attribute);
                    spec_sort = Mappings.isSpecSortKeyExists(attribute) ? Mappings.specSortValue(attribute) : {};
                    query = Mappings.isQueryExists(attribute) ? Mappings.queryValue(attribute) : {};
                    output = Helper.addPrevQuery(sessionId, query, {}, spec_query, filter);
                    spec_query = output["query"];
                    console.log(spec_sort, spec_query);
                    filter = output["filter"];
                    lContext.storeNewSessionKey(sessionId, "feature_pref", [attribute]);

                    if (Mappings.isReasonExists(attribute)) list_reason_message = Messages.messageKeyValue("listReason", Mappings.getReasonMessage(attribute));
                }
            }
            var price_range_filter = { 'price': { 'gte': localContext.sessionVars.start_price,
                    'lte': localContext.sessionVars.end_price } };
            filter_list.push({ 'range': price_range_filter });
        }

        /*
         *  completed DB query formation .....
         */
        if (list_reason_message) lContext.storeNewKey(sessionId, "list_reason_message", list_reason_message);

        var messages = [];
        var output;

        // check user asks in prev list or not..
        if (Helper.isKeyExists("prev_list", localContext) && !Helper.isKeyExists("prev_list_answer", context) && !Helper.isKeyExists("list_synonyms", context) && !Helper.isKeyExists("preference", context)) {
            var option_message = {};
            option_message["header"] = Messages.listMessage("listQuestMessage");
            option_message["options"] = ["Yes", "No"];
            messages.push({ type: "buttons", message: option_message });
            lContext.storeNewKey(sessionId, "prev_message", "listQuestMessage");
            cb(context, messages);
            return;
        }

        var is_prev_list_answer_exist = Helper.isKeyExists("prev_list_answer", context) || Helper.isKeyExists("list_synonyms", context);

        if (Helper.isKeyExists("prev_list", localContext) && is_prev_list_answer_exist) {
            var answer = context.prev_list_answer;

            if (answer == "yes" || Helper.isKeyExists("list_synonyms", context)) {
                console.log("prev list yes");
                var prev_spec_query = localContext.prev_list_query.spec_query;
                var prev_filter = localContext.prev_list_query.filter;
                var output = Helper.addPrevQuery(sessionId, spec_query, filter, prev_spec_query, prev_filter);
                spec_query = output["query"];
                filter = output["filter"];

                if (featureList.length > 0) feature = featureList[0];else if (Helper.isKeyExists("intent", context)) feature = context.intent.toLowerCase().trim();

                if (spec_query && Object.keys(spec_query).length == 0) spec_query = undefined;
                if (spec_sort && Object.keys(spec_sort).length == 0) spec_sort = undefined;

                var prev_list = localContext["prev_total_list"];
                var idList = localContext["prev_total_list_ids"];
                var newIdList = [];
                for (var i = 0; i < idList.length; i++) {
                    newIdList.push(parseInt(idList[i]));
                }

                fields = Mappings.getFieldsAttribute("skuAndroid");

                // console.log(fields);
                if (query["bool"] == null) query = { "bool": { "must": [{ "ids": { "values": idList } }] } };else query["bool"]["must"].push({ "ids": { "values": idList } });

                Search.findSpecMobile(sort, query, filter, fields, function (data) {
                    Helper.storePrevQuery(sessionId, spec_sort, spec_query, filter);
                    cb(context, Helper.printMessagesWhenPrevList(data.hits.hits, sessionId, feature));
                });

                // cb(context,msgs);
                return;
            } else {
                lContext.deleteKey(sessionId, "prev_list_query");
                lContext.deleteKey(sessionId, "prev_list");
                if (!Helper.isKeyExists("features", context)) lContext.deleteSessionKey(sessionId, "feature_pref");
                lContext.deleteKey(sessionId, "question_count");
            }
        }

        console.log("..................normal flow .........");
        console.log(localContext.sessionVars);

        if (!Helper.isKeyExists("start_price", localContext.sessionVars)) {
            messages.push({ type: "price", message: Messages.listMessage("priceRange") });
            lContext.storeNewKey(sessionId, "prev_message", "priceRangeMessage");
            cb(context, messages);
            return;
        }
        console.log(" price range message ended.");

        // if the did not specify any feature , let him choose any of the feature
        if (!Helper.isKeyExists("feature_pref", localContext.sessionVars) && !Helper.isKeyExists("intent", context)) {
            messages = messages.concat(Helper.specMessage(sessionId, source));
            cb(context, messages);
            return;
        } else {
            if (Helper.isKeyExists("feature_pref", localContext.sessionVars)) featureList = localContext.sessionVars.feature_pref;

            var feature_user_case_question_key_list = [];
            if (featureList.length > 0) {
                for (var z = 0; z < featureList.length; z++) {
                    var feature = featureList[z].toLowerCase();
                    var use_case_questions = Messages.hasUseCaseQuests(feature) ? Messages.getUseCaseQuestions(feature) : undefined;
                    if (use_case_questions != undefined) {
                        var use_case_preference_keys = Object.keys(use_case_questions);
                        feature_user_case_question_key_list = feature_user_case_question_key_list.concat(use_case_preference_keys);
                    }
                }
            }
            console.log("length ", feature_user_case_question_key_list);
            if (feature_user_case_question_key_list.length > 0) {

                var question_count = feature_user_case_question_key_list.length;
                if (question_count > 0 && !Helper.isKeyExists("question_count", localContext)) {
                    messages.push({ type: "text", message: Messages.countMessages(question_count) });
                    lContext.storeNewKey(sessionId, "question_count", "yes");
                }

                for (var i in feature_user_case_question_key_list) {
                    var use_case_preference_key = feature_user_case_question_key_list[i];
                    if (!Helper.isKeyExists(use_case_preference_key, localContext.sessionVars)) {
                        console.log("use case questions for: ", feature + " key is " + use_case_preference_key);
                        lContext.storeNewKey(sessionId, "prev_message", use_case_preference_key);
                        var options = Messages.getUseCaseAnswer(use_case_preference_key);
                        console.log(options);
                        var header_question = options["header_question"];
                        var options_message = {};
                        options_message["header"] = header_question;

                        if (options["type"] == "buttons") {
                            options_message["options"] = options["questions"];
                            messages.push({ type: "buttons", message: options_message });
                        } else if (options["type"] == "checklist") {
                            options_message["checklist"] = options["questions"];
                            options_message["max_select"] = options["max_select"];
                            messages.push({ type: "checkList", message: options_message });
                        }
                        lContext.storeNewSessionKey(sessionId, use_case_preference_key, "nothing");
                        cb(context, messages);
                        return;
                    }
                }
            }
        }

        console.log(" DB QUERY FOR FIND PHONES");
        var fields = Mappings.getFieldsAttribute("skuAndroid");
        if (spec_query && Object.keys(spec_query).length == 0) spec_query = undefined;
        if (spec_sort && Object.keys(spec_sort).length == 0) spec_sort = undefined;
        //var specSortList = [];

        var listMessages = [];

        if (featureList.length == 1 || Helper.isKeyExists("intent", context)) {
            if (featureList.length == 1) feature = featureList[0].toLowerCase();else feature = context.intent.toLowerCase().trim();
            var sort = Mappings.isSpecSortKeyExists(feature) ? Mappings.specSortValue(feature) : undefined;
            Search.findSpecMobile(sort, spec_query, filter, fields, function (data) {
                Helper.storePrevQuery(sessionId, spec_sort, spec_query, filter);
                cb(context, Helper.filterBrandPref(data.hits.hits, source, sessionId, feature, "one"));
            });
        } else if (featureList.length > 1) {
            var feature1 = featureList[0].toLowerCase();
            var feature2 = featureList[1].toLowerCase();
            Search.findSpecMobile(sort, spec_query, filter, fields, function (data) {
                Helper.storePrevQuery(sessionId, spec_sort, spec_query, filter);
                listMessages = listMessages.concat(Helper.filterBrandPref(data.hits.hits, source, sessionId, feature1, "two"));
                Search.findSpecMobile(sort, spec_query, filter, fields, function (data) {
                    Helper.storePrevQuery(sessionId, spec_sort, spec_query, filter);
                    listMessages = listMessages.concat(Helper.filterBrandPref(data.hits.hits, source, sessionId, feature2, "two"));

                    console.log(listMessages.length);

                    messages.push({ type: "text", message: "Please scroll up to see the results" });
                    var listTypeMessages = [];
                    for (var z = 0; z < listMessages.length; z++) {
                        var msg = listMessages[z];
                        if (msg["type"] == "list") {
                            listTypeMessages.push(msg["message"]);
                        }
                        if (msg["type"] == "text") messages.push(msg);
                    }
                    var bottom_message = "Considering both the lists we have sorted the phones based on best " + feature1 + " " + "and " + feature2;
                    messages.push({ type: "text", message: bottom_message });
                    var combined_list = Helper.processCombinedList(listTypeMessages, feature1, feature2);

                    var relAttribute = Mappings.hasReleventAttriubte(feature1) ? Mappings.getRelevantAttribute(feature1) : [];
                    relAttribute = relAttribute.concat(Mappings.hasReleventAttriubte(feature2) ? Mappings.getRelevantAttribute(feature2) : []);
                    messages.push({ type: "list", message: combined_list, relevant_attribute: relAttribute });

                    //   console.log("entities_and_values list messages ",messages);
                    cb(context, messages);
                });
            });
        }
        //  cb(context,listMessages);
        // return;
    },
    ['sortPhoneList'](sessionId, context, source, cb) {
        // in two skus

        console.log('sortPhonelist function running');
        var localContext = lContext.userContext(sessionId);
        var spec_sort = {};
        var spec_query = {};
        var filter = {};
        var query;
        var list_reason_message;

        var present_context_keys = Object.keys(context);
        var sort_key_list = ["sim_type", "sim_size", "network_support", "camera_features", "gps_type", "usb_type", "display_type", "gpu_type", "processor_core_type", "battery_type", "audio_formats", "screen_protection", "sensor_type", "processor_type", "attribute", "features"];

        sort_key_list = sort_key_list.filter(function (n) {
            return present_context_keys.indexOf(n) != -1;
        });

        var key = context[sort_key_list[0]];
        key = key.toLowerCase();

        spec_sort = Mappings.isSpecSortKeyExists(key) ? Mappings.specSortValue(key) : undefined;
        console.log("prev list yes");
        var prev_spec_query = localContext.prev_list_query.spec_query;
        var prev_filter = localContext.prev_list_query.filter;
        var output = Helper.addPrevQuery(sessionId, spec_query, filter, prev_spec_query, prev_filter);
        spec_query = output["query"];
        filter = output["filter"];

        if (spec_query && Object.keys(spec_query).length == 0) spec_query = undefined;
        if (spec_sort && Object.keys(spec_sort).length == 0) spec_sort = undefined;

        var fields = Mappings.getFieldsAttribute("skuAndroid");
        Search.findSpecMobile(spec_sort, spec_query, filter, fields, function (data) {
            Helper.storePrevQuery(sessionId, spec_sort, spec_query, filter);
            cb(context, Helper.printMessagesWhenPrevList(data.hits.hits, sessionId, key));
        });
    },
    ['similarPhones'](sessionId, context, source, cb) {
        var model_name = context.sku;
        var field = "price";
        var messages = [];

        Helper.getAttributeValueFromDB(field, model_name, function (result) {

            var price = parseInt(result);
            var sort = Mappings.specSortValue("overall");
            var query = undefined;
            var filter = { 'range': { 'price': { 'gte': price - 5000, 'lte': price + 5000 } } };
            var fields = Mappings.getFieldsAttribute("skuAndroid");
            Search.findSpecMobile(sort, query, filter, fields, function (data) {

                var list = data.hits.hits;
                if (list.length == 0) {
                    messages.push({ type: "text", message: Messages.listMessage("notAvailable") });
                    cb(context, messages);
                    return;
                }

                if (source == "fb") {
                    list = list.slice(0, 7);
                } else if (source == "android") {
                    list = Helper.addFieldsToList(list);
                }

                // messages.push({ type: "text", message: Messages.listMessage("beforeList") });
                messages.push({ type: "list", message: list, relevant_attribute: [] });
                // messages.push({type: "text", message: Messages.listMessage("scroll")});
                messages.push({ type: "text", message: Messages.listMessage("afterList") });
                cb(context, messages);
            });
        });
    },
    ['findGenderMobile'](sessionId, context, source, cb) {

        var localContext = lContext.userContext(sessionId);
        var messages = [];
        if (!Helper.isKeyExists("start_price", localContext.sessionVars)) {
            messages.push({ type: "price", message: Messages.listMessage("priceRangeMessage") });
            lContext.storeNewKey(sessionId, "prev_message", "priceRangeMessage");
            cb(context, messages);
            return;
        }
        if (!Helper.isKeyExists("age", context)) {
            if (context.gender == "female") messages.push({ type: "text", message: Messages.listMessage("ageShe") });else if (context.gender == "male") messages.push({ type: "text", message: Messages.listMessage("ageHe") });else messages.push({ type: "text", message: Messages.listMessage("age") });
            lContext.storeNewKey(sessionId, "prev_message", "agePrefMessage");
            cb(context, messages);
            return;
        }
        var sort;
        if (context.gender == "female") sort = Mappings.specSortValue("adult female");else if (context.gender == "male") sort = Mappings.specSortValue("adult male");else if (context.gender == "kid") sort = Mappings.specSortValue("kids");

        var query = undefined;
        var filter_list = [];
        var price_range_filter = { 'range': { 'price': { 'gte': localContext.sessionVars.start_price,
                    'lte': localContext.sessionVars.end_price } } };
        filter_list.push(price_range_filter);

        if (context.age < 15) {
            var ram_filter = { 'range': { 'ram_memory': { 'gte': 1 } } };
            filter_list.push(ram_filter);
            var screen_size_filter = { 'range': { 'screen_size': { 'lt': 4.5 } } };
            filter_list.push(screen_size_filter);
            query = { bool: { "must_not": [{ "match": { "water_proof_rate": "no" } }] } };
        }
        var filter = {};
        filter["and"] = filter_list;

        var fields = Mappings.getFieldsAttribute("skuAndroid");
        console.log(sort, query, filter);
        Search.findSpecMobile(sort, query, filter, fields, function (data) {
            var list = data.hits.hits;
            if (list.length == 0) {
                messages.push({ type: "text", message: Messages.listMessage("notAvailable") });
                cb(context, messages);
                return;
            }
            if (source == "fb") {
                list = list.slice(0, 7);
                messages.push({ type: "list", message: list });
            } else if (source == "android") {
                var newList = [];
                for (var i = 0; i < list.length; i++) newList.push(list[i]["fields"]);
                messages.push({ type: "list", message: newList, relevant_attribute: [] });
            }
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },

    // compare skus and sku specs and attributes
    ['compareMobiles'](sessionId, context, source, cb) {
        var localContext = lContext.userContext(sessionId);
        console.log("compare mobile specs");
        var key;
        if (Helper.isKeyExists("features", context)) key = context.features;else if (Helper.isKeyExists("attribute", context)) key = context.attribute;else {
            if (source == 'fb') key = "phone";else key = "skuAndroid";
        }

        var model_names = [context.sku1, context.sku2];
        console.log(localContext.sku1 + " " + localContext.sku2);
        var messages = [];
        var fields = ["model_name"];
        console.log("Right file");
        var attribute_fields = Mappings.getFieldsAttribute(key);
        console.log(attribute_fields);
        fields = fields.concat(attribute_fields);

        Helper.getFieldsFromDB(fields, model_names, function (compare_result) {

            messages.push({ type: "text", message: Messages.listMessage("compare") });
            if (source == "fb") {

                messages.push({
                    type: "text",
                    message: Helper.separateKeyValueSKU(compare_result[0], fields, 0, fields.length)
                });
                messages.push({
                    type: "text",
                    message: Helper.separateKeyValueSKU(compare_result[1], fields, 0, fields.length)
                });
            } else if (source == "android") if (key != "skuAndroid") {
                messages.push({
                    type: "text",
                    message: Helper.separateKeyValueSKU(compare_result[0], fields, 0, fields.length)
                });
                messages.push({
                    type: "text",
                    message: Helper.separateKeyValueSKU(compare_result[1], fields, 0, fields.length)
                });
            }
            messages.push({ type: "compare", message: model_names });
            // messages.push({type: "text", message: Messages.getBrowseMessage("scroll")});
            cb(context, messages);
        });
    },
    ['betterPhoneInTwo'](sessionId, context, source, cb) {
        // in two skus
        var model_names = [context.sku1, context.sku2];
        var map_key;
        if (Helper.isKeyExists("features", context)) map_key = context.features;else if (Helper.isKeyExists("attribute", context)) map_key = context.attribute;else map_key = "better";
        Helper.betterMobiles(map_key, model_names, function (messages) {
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['betterThanSKU'](sessionId, context, source, cb) {

        var model_names = [context.sku];
        var fields = Mappings.getFieldsAttribute("skuAndroid");
        var messages = [];

        Helper.getFieldsFromDB(fields, model_names, function (result_list) {
            console.log(result_list);
            var overall_score = parseFloat(result_list[0]["overall_score"]);
            var price = result_list[0]["price"];
            var specs = Mappings.specSortValue("price");
            var query = undefined;
            var filter = { "and": [{ "range": { "overall_score": { "gte": overall_score } } }] };

            fields = Mappings.getFieldsAttribute("skuAndroid");
            Search.findSpecMobile(specs, query, filter, fields, function (data) {
                var list = data.hits.hits;
                if (list.length == 0) {
                    messages.push({ type: "text", message: Messages.listMessage("notAvailable") });
                    cb(context, messages);
                    return;
                }
                Helper.storePrevQuery(sessionId, specs, query, filter);
                if (source == "fb") {
                    list = list.slice(0, 7);
                    messages.push({ type: "list", message: list });
                } else if (source == "android") {
                    var newList = [];
                    for (var i = 0; i < list.length; i++) newList.push(list[i]["fields"]);
                    messages.push({ type: "list", message: newList, relevant_attribute: [] });
                }
                // messages.push({type: "text", message: Messages.listMessage("scroll")});
                cb(context, messages);
            });
        });
    },

    //  single sku question
    ['getAttributeValueSKU'](sessionId, context, source, cb) {
        var messages = [];
        var model_name = context.sku;
        var attribute = context.attribute.toLowerCase();
        var key = Mappings.isDbKeyExists(attribute) ? Mappings.getDbKey(attribute) : undefined;
        if (key == null) {
            messages.push({ type: "text", message: Messages.listMessage("noInfo") });
            cb(context, messages);
            return;
        }

        Helper.getAttributeValueFromDB(key, model_name, function (data) {
            var units = Mappings.isUnitExists(key) ? Mappings.getUnitKey(key) : "";
            var knowledge_answer = Mappings.haveKnowledge(attribute) ? Mappings.getKnowledge(attribute) : undefined;
            var send_msg = data + " " + units + "\n";

            console.log(key);
            if (Messages.doesHaveMessageForAttribute(key)) messages.push({ type: "text", message: Messages.getHeaderMessageForAttributeValue(key, context) });
            if (context.attribute == 'rating') {
                var rating = parseFloat(send_msg);
                rating = rating.toFixed(2);
                var message = Messages.ratingMessage(context.sku, rating);
                messages.push({ type: "text", message: message });
            } else messages.push({ type: "text", message: send_msg });

            if (knowledge_answer != undefined) messages.push({ type: "text", message: knowledge_answer });

            if (source == "android") messages.push({ type: "sku", message: [context.sku] });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['singlePhoneDetails'](sessionId, context, source, cb) {

        var model_names = [context.sku];
        var messages = [];
        var fields = ["model_name"];
        fields = fields.concat(Mappings.getFieldsAttribute("sku"));
        Helper.getFieldsFromDB(fields, model_names, function (result_list) {
            var output = Helper.separateKeyValueSKU(result_list[0], fields, 0, fields.length);
            messages.push({ type: "text", message: output });
            if (source == "android") messages.push({ type: "sku", message: model_names });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['specsOfSKU'](sessionId, context, source, cb) {

        console.log(" running specsOfSku");
        var map_key;
        var localContext = lContext.userContext(sessionId);
        if (Helper.isKeyExists("features", context)) map_key = context.features;else if (Helper.isKeyExists("attribute", context)) map_key = context.attribute;else map_key = "sku";
        var model_names = [context.sku];
        var messages = [];
        var fields = ["model_name"];
        fields = fields.concat(Mappings.getFieldsAttribute(map_key));
        console.log("fields :", fields);
        Helper.getFieldsFromDB(fields, model_names, function (result_list) {
            var output = Helper.separateKeyValueSKU(result_list[0], fields, 0, fields.length);
            messages.push({ type: "text", message: output });
            if (source == "android") messages.push({ type: "sku", message: model_names });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['howSpecs'](sessionId, context, source, cb) {
        actions['specReview'](sessionId, context, source, cb);
    },
    ["dimensionsSKU"](sessionId, context, source, cb) {
        var fields = ["model_name", "phone_height", "phone_width", "thickness"];
        var messages = [];
        Helper.getFieldsFromDB(fields, [context.sku], function (result_list) {
            console.log(result_list[0]);
            var output = Helper.separateKeyValueSKU(result_list[0], fields, 0, fields.length);
            messages.push({ type: "text", message: output });
            if (source == "android") messages.push({ type: "sku", message: [context.sku] });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['specReview'](sessionId, context, source, cb) {

        var map_key;
        if (Helper.isKeyExists("features", context)) {
            map_key = context.features.toLowerCase() + " review";
        } else {
            map_key = "verdict";
        }

        var messages = [];
        var model_name = context.sku;
        var key = Mappings.isDbKeyExists(map_key) ? Mappings.getDbKey(map_key) : undefined;
        if (key == undefined) {
            messages.push({ type: "text", message: Messages.listMessage("noInfo") });
            cb(context, messages);
            return;
        }

        Helper.getAttributeValueFromDB(key, model_name, function (data) {

            messages.push({ type: "text", message: data });
            if (source == "android") messages.push({ type: "sku", message: [context.sku] });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['SKUReview'](sessionId, context, source, cb) {
        var model_name = context.sku;
        console.log("Start of SKUReview function");
        Helper.getAttributeValueFromDB('verdict_review', model_name, function (data) {
            var review = data;
            var messages = [];

            messages.push({ type: "text", message: review });
            if (source == "android") messages.push({ type: "sku", message: [context.sku] });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['checkAttributeSKU'](sessionId, context, source, cb) {
        var localContext = lContext.userContext(sessionId);
        var messages = [];
        var present_context_keys = Object.keys(context);
        var knowledge_key_list = ["sim_type", "network_support", "camera_features", "gps_type", "usb_type", "display_type", "gpu_type", "processor_core_type", "battery_type", "audio_formats", "screen_protection", "sensor_type", "processor_type", "attribute"];

        knowledge_key_list = knowledge_key_list.filter(function (n) {
            return present_context_keys.indexOf(n) != -1;
        });
        var has_units;
        if (knowledge_key_list.length != 0) {
            var key = knowledge_key_list[0];
            var value = context[knowledge_key_list[0]];
            has_units = false;
        }

        if (Helper.isKeyExists("units", context)) {
            key = Mappings.getDbKey(context.attribute.toLowerCase());
            value = context.attribute_quantity;
            has_units = true;
        }

        var fields = ["model_name", key];
        var output;

        Helper.getFieldsFromDB(fields, [context.sku], function (result_list) {

            console.log("result list", result_list);
            if (has_units) {
                var result = parseInt(result_list[0][key][0]);
                value = parseInt(value);
                console.log(typeof result, typeof value);
                if (result == value) output = "Yes";else output = "No";
            } else {
                var result = result_list[0][key][0].toLowerCase();
                value = value.toLowerCase();
                if (result.indexOf(value) > -1) output = "Yes";else output = "No";
            }

            messages.push({ type: "text", message: output });
            if (source == "android") messages.push({ type: "sku", message: [context.sku] });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['ratingMobile'](sessionId, context, source, cb) {

        var rating_field;
        if (context.platforms == "flipkart") rating_field = ["average_rating_flipkart", "no_of_ratings_flipkart"];else if (context.platforms == "amazon") rating_field = ["average_rating_amazon", "no_of_ratings_amazon"];

        Search.ratingPhone(context.platforms, rating_field, context.sku, function (data) {
            var rating = context.attribute === 'rating' ? data.hits.hits[0]["fields"][rating_field[0]][0] : data.hits.hits[0]["fields"][rating_field[1]][0];
            if (rating == 0) rating = Messages.listMessage("noRating");
            rating = context.platforms + " ratings for " + context.sku + " is " + rating;
            var messages = [];
            messages.push({ type: "text", message: rating });
            if (source == "android") messages.push({ type: "sku", message: [context.sku] });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['buyPhone'](sessionId, context, source, cb) {

        var localContext = lContext.userContext(sessionId);
        Helper.getAttributeValueFromDB("purchase_url", context.sku, function (data) {
            var messages = [];
            messages.push({ type: "text", message: data });
            if (source == "android") messages.push({ type: "sku", message: [context.sku] });
            cb(context, messages);
        });
    },
    ['positiveSKU'](sessionId, context, source, cb) {
        Helper.getAttributeValueFromDB("pros", context.sku, function (data) {
            var messages = [];
            messages.push({ type: "text", message: data });
            if (source == "android") messages.push({ type: "sku", message: [context.sku] });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['negativeSKU'](sessionId, context, source, cb) {
        Helper.getAttributeValueFromDB("cons", context.sku, function (data) {
            var messages = [];
            messages.push({ type: "text", message: data });
            if (source == "android") messages.push({ type: "sku", message: [context.sku] });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['opinionSKU'](sessionId, context, source, cb) {
        var messages = [];
        var fields = ['pros', 'cons', "model_name"];
        Helper.getFieldsFromDB(fields, [context.sku], function (result_list) {

            var pros = "Pros: \n" + result_list[0]["pros"][0];
            var cons = "Cons: \n" + result_list[0]["cons"][0];
            var messages = [];
            messages.push({ type: "text", message: pros });
            messages.push({ type: "text", message: cons });
            if (source == "android") messages.push({ type: "sku", message: [context.sku] });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['publicTalk'](sessionId, context, source, cb) {
        var messages = [];
        var model_name = context.sku;
        var key = "user_review";
        if (key == null) {
            messages.push({ type: "text", message: Messages.listMessage("noInfo") });
            cb(context, messages);
            return;
        }

        Helper.getAttributeValueFromDB(key, model_name, function (data) {
            console.log(data);

            var send_msg = data + "  \n";

            messages.push({ type: "text", message: send_msg });
            if (source == "android") messages.push({ type: "sku", message: [context.sku] });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },

    // knowledge questions
    ['getAttributeValueALL'](sessionId, context, source, cb) {
        var model_names = [];
        var localContext = lContext.userContext(sessionId);
        var phone_list = localContext["user_shown_list"];
        for (var i = 0; i < phone_list.length; i++) model_names.push(phone_list[i]["fields"]["model_name"][0]);
        var messages = [];
        var attribute = context.attribute.toLowerCase();
        console.log(attribute);
        var key = Mappings.isDbKeyExists(attribute) ? Mappings.getDbKey(attribute) : undefined;
        console.log("key");
        if (key == undefined) {
            messages.push({ type: "text", message: Messages.listMessage("noInfo") });
            cb(context, messages);
            return;
        }
        var fields = ["model_name", key];
        console.log(model_names);
        Helper.getFieldsFromDB(fields, model_names, function (result_list) {
            var send_msg = "";
            var units = Mappings.isUnitExists(key) ? Mappings.getUnitKey(key) : "";

            for (var k = 0; k < model_names.length; k++) {
                for (var j = 0; j < result_list.length; j++) {
                    if (model_names[k] == result_list[j]["model_name"][0]) send_msg += result_list[j]["model_name"][0] + " : " + result_list[j][key][0] + " " + units + "\n";
                }
            }
            console.log("sending message", send_msg);
            messages.push({ type: "text", message: send_msg });
            // messages.push({type: "text", message: Messages.listMessage("scroll")});
            cb(context, messages);
        });
    },
    ['knowledgeQuestion'](sessionId, context, source, cb) {
        var localContext = lContext.userContext(sessionId);
        var messages = [];
        var present_context_keys = Object.keys(context);
        var knowledge_key_list = ["sim_type", "sim_size", "network_support", "camera_features", "gps_type", "usb_type", "display_type", "gpu_type", "processor_core_type", "battery_type", "audio_formats", "screen_protection", "sensor_type", "processor_type", "attribute"];

        knowledge_key_list = knowledge_key_list.filter(function (n) {
            return present_context_keys.indexOf(n) != -1;
        });

        var key = context[knowledge_key_list[0]];
        console.log(key.toLowerCase());
        var knowledge_answer = Mappings.haveKnowledge(key.toLowerCase()) ? Mappings.getKnowledge(key.toLowerCase()) : undefined;
        if (knowledge_answer == undefined) {
            messages.push({ type: "text", message: Messages.listMessage("notFound") });
            cb(context, messages);return;
        }

        messages.push({ type: "text", message: knowledge_answer });
        cb(context, messages);
    },
    ['bestAttributeInMarket'](sessionId, context, source, cb) {

        var messages = [];
        var field_rank = {};
        var localContext = lContext.userContext(sessionId);
        var attribute_score;
        if (Mappings.hasSpecScores(context.attribute.toLowerCase())) {
            attribute_score = Mappings.getSpecScores(context.attribute.toLowerCase());
            field_rank[attribute_score] = 'desc';
        } else if (Mappings.isHaveRank(context.attribute.toLowerCase())) {
            attribute_score = Mappings.getRank(context.attribute.toLowerCase());
            field_rank[attribute_score] = 'asc';
        } else {
            messages.push({ type: "text", message: Messages.listMessage("notFound") });
            cb(context, messages);return;
        }

        var key = Mappings.getDbKey(context.attribute.toLowerCase());
        var units = Mappings.isUnitExists(key) ? Mappings.getUnitKey(key) : "";
        console.log(field_rank, key);

        Search.getFieldRank(key, field_rank, function (data) {
            var attribute_market = data.hits.hits[0]['fields'][key][0];
            var attribute_market1 = Messages.messageKeyValue("messageKeyValue", context.attribute);
            messages.push({ type: "text", message: attribute_market + " " + units });
            messages.push({ type: "text", message: attribute_market1 });
            cb(context, messages);
        });
    },
    ["attributeList"](sessionId, context, source, cb) {

        var messages = [];
        var attribute = context.attribute.toLowerCase();
        var attribute_list = Mappings.isrankedAttributeExists(attribute) ? Mappings.getrankedAttribute(attribute) : "no";
        if (attribute_list !== "no") {
            var message = "";
            for (var i = 0; i < 10; i++) message += i + 1 + ". " + attribute_list[i] + "\n";
            messages.push({ type: "text", message: attribute_list });
            cb(context, messages);
        } else {
            messages.push({ type: "text", message: Messages.listMessage("notFound") });
            cb(context, messages);
        }
    },

    // text sending to user
    ['greet'](sessionId, context, source, cb) {

        var response = "Hello";
        console.log(response);
        var messages = [];
        messages.push({ type: "text", message: response });
        cb(context, messages);
    },
    ['betterThanPhone'](sessionId, context, source, cb) {
        var response = Messages.listMessage('presentSKUQuestion');
        lContext.storeNewKey(sessionId, "prev_message", "presentSKUQuestion");
        var messages = [];
        messages.push({ type: "text", message: response });
        cb(context, messages);
    },
    ['posExpression'](sessionId, context, source, cb) {

        var msg = ":)";
        var messages = [];
        messages.push({ type: "text", message: msg });
        cb(context, messages);
    },
    ['negExpression'](sessionId, context, source, cb) {
        var msg = Messages.listMessage("negExp");
        var messages = [];
        messages.push({ type: "text", message: msg });
        cb(context, messages);
    },
    ['helpMessage'](sessionId, context, source, cb) {
        var messages = [];messages.push({ type: "text", message: Messages.listMessage("help") });
        cb(context, messages);
    },
    ['trivia'](sessionId, context, source, cb) {
        var msg = Messages.triviaReply(context.trivia);
        var messages = [];messages.push({ type: "text", message: msg });
        cb(context, messages);
    },
    ['complex_sentence'](sessionId, context, source, cb) {
        var msg = Messages.complexSentenceReply(context.complex_sentence);
        var messages = [];messages.push({ type: "text", message: msg });
        cb(context, messages);
    },
    ['profanity'](sessionId, context, source, cb) {
        var message = "That's not a proper language to use. ";
        var messages = [];
        messages.push({ type: "text", message: message });
        cb(context, messages);
    },
    ['destroyEverything'](sessionId, context, source, cb) {
        context = {};
        console.log("new Context");
        console.log(context);
        lContext.deleteContext(sessionId, function (data) {
            var messages = [];
            if (source == "fb") messages.push({ type: "text", message: Messages.listMessage("clear") });
            if (source == "android") messages.push({ type: "clear", message: Messages.listMessage("clear") });
            cb(context, messages);
        });
    },

    //check sentence
    ['checkSentence'](sessionId, context, source, cb) {
        console.log("check sentence in");
        var messages = [];
        var localContext = lContext.userContext(sessionId);
        Semantics.findSim(localContext.user_message, function (data) {
            console.log(data);
            if (data.status === true || data.status == 'check') {
                console.log("yes");
                lContext.storeNewKey(sessionId, "last_message", data.sentence);
                context = Helper.storeValInContext(context, "checked_sentence", "Do you mean \'" + data.sentence + "\' Y / N ", true);
                lContext.storeNewKey(sessionId, "next_check_message", "yes");
                messages.push({ type: "text", message: context.checked_sentence });
                cb(context, messages);
            } else {
                console.log("new error");
                //context = Helper.storeValInContext(context, "check_message", "no", false);
                context = Helper.storeValInContext(context, "checked_sentence", Messages.listMessage("notFound"), sessionId, false);
                messages.push({ type: "text", message: context.checked_sentence });
                cb(context, messages);
            }
        });
    }
};

function witProcessMessage(sessionId, message, email, source, context, callback) {

    if (!lContext.isSessionExists(sessionId)) lContext.createContext(sessionId);

    var localContext = lContext.userContext(sessionId);
    if (source == "android") {
        var sendJson = {};
        sendJson["username"] = "prodX";
        sendJson["message"] = "";
        var socket = global.getUserSocket(sessionId);
    }

    witAPIs.witMessageAPI(message, context, function (data) {
        var message_api_response = JSON.parse(data);
        actions.merge(sessionId, context, message_api_response["entities"], message, function (result) {
            context = result["final_context"];
            console.log("result", result);
            var bot_function = result["bot_function"];

            console.log("bot function in wit api", bot_function);

            if (bot_function == null) {
                // no function to execute  // send sorry message..
                var messages = [{ type: "text", message: Messages.listMessage("sorryMessage") }];
                if (source == "fb") {
                    actions.say(sessionId, context, messages);
                } else if (source == "android") {
                    sendJson["message"] = [Messages.listMessage("sorryMessage")];
                    socket.emit("bot message", sendJson);
                }
            }

            if (bot_function != "findAllPhones") {
                if (Helper.isKeyExists("prev_list", localContext)) {
                    if (!Helper.isKeyExists("has_list_reference", localContext)) {
                        lContext.deleteKey(sessionId, "prev_list");
                    } else {
                        lContext.deleteKey("has_list_reference", localContext);
                    }
                }
            }

            try {
                actions[bot_function](sessionId, context, source, function (newContext, messages) {
                    console.log("response after function");
                    if (lContext.question_message != "yes") {
                        var localContext = lContext.userContext(sessionId);
                        var pointer_message = Messages.getPointerMessage(localContext, bot_function, newContext, messages);
                        var questionAsked = false;
                        if (bot_function == "findAllPhones" || bot_function == "findGenderMobile" || bot_function == "betterThanSKU") {
                            if (localContext.prev_message == "priceRangeMessage" || localContext.prev_message == "brandPrefMessage" || localContext.prev_message == "specPrefMessage" || localContext.prev_message == "listQuestMessage" || localContext.prev_message == "agePrefMessage" || localContext.prev_message == "front_camera_pref" || localContext.prev_message == "video_recording_pref" || localContext.prev_message == "photo_storage_pref" || localContext.prev_message == "gaming" || localContext.prev_message == "app_running" || localContext.prev_message == "spend_time" || localContext.prev_message == "network_type" || localContext.prev_message == "spend_time_battery" || localContext.prev_message == "after_battery_important" || localContext.prev_message == "record_videos" || localContext.prev_message == "after_camera_important" || localContext.prev_message == "frequent_use_activity" || localContext.prev_message == "use_phone_light" || localContext.prev_message == "relevant_internal_memory" || localContext.prev_message == "micro_sd_card_cost") {
                                questionAsked = true;
                            }
                        }
                        if (bot_function == "betterThanPhone") questionAsked = true;
                        if (bot_function == "destroyEverything") questionAsked = true;

                        if (Messages.getBrowseMessage(bot_function, context) != null && !questionAsked) {
                            messages.push({
                                type: "text",
                                message: Messages.getBrowseMessage(bot_function, context)
                            });
                        }
                        if (questionAsked == false) {
                            messages.push({ type: "text", message: pointer_message });
                        }
                    }

                    var timestamp = moment().format('MMM DD, YYYY,h:mm:ss a');
                    timestamp = new Date().getTime();

                    for (var j = 0; j < messages.length; j++) {
                        if (messages[j].type == "text") {
                            var content = messages[j]['message'];
                            if (content == null || content == undefined) content = "  ";
                            var details = {
                                'session_id': sessionId, 'sender': 'bot', 'content': content,
                                'username': email, 'timestamp': timestamp
                            };
                            db.inserttodB(details, "chatapp_msg");
                        }
                    }
                    if (source == "fb") {
                        for (var i = 0; i < messages.length; i++) {
                            if (messages[i]["type"] === "list") {
                                var phone_list = messages[i]["message"];
                                messages[i]["message"] = Helper.makeListFBFormat(phone_list);
                            }
                        }
                        actions.say(sessionId, newContext, messages);
                    } else if (source == "android") {

                        socket.emit("bot pointers", { "pointers": Messages.getPointers(localContext, bot_function, newContext, messages) });
                        var textMessages = [];
                        var timestamp = moment().format('MMM DD, YYYY,h:mm:ss a');
                        for (var j = 0; j < messages.length; j++) {
                            if (messages[j].type == "text") {
                                textMessages.push(messages[j]["message"]);
                            }
                        }
                        sendJson["message"] = textMessages;
                        socket.emit("bot message", sendJson);

                        for (var i = 0; i < messages.length; i++) {
                            var msg = messages[i];
                            sendJson["message"] = msg["message"];

                            if (msg.type == "list") {
                                sendJson["relevant_attribute"] = msg["relevant_attribute"];
                                socket.emit("bot list", sendJson);
                            } else if (msg.type == "compare") {

                                var model_names = msg["message"];
                                var fields = Mappings.getFieldsAttribute("skuAndroid");
                                Helper.getFieldsFromDB(fields, model_names, function (result_list) {
                                    var obj = {};
                                    obj["mobile1"] = result_list[0];
                                    obj["mobile2"] = result_list[1];
                                    sendJson["message"] = obj;
                                    socket.emit("bot compare", sendJson);
                                });
                            } else if (msg.type == "sku") {

                                var model_names = msg["message"];
                                var fields = Mappings.getFieldsAttribute("skuAndroid");
                                Helper.getFieldsFromDB(fields, model_names, function (result_list) {
                                    sendJson["message"] = result_list[0];
                                    socket.emit("bot sku", sendJson);
                                });
                            } else if (msg.type == "clear") {
                                socket.emit("bot clear", sendJson);
                            } else if (msg.type == "buttons") {
                                sendJson["message"] = msg["message"];
                                socket.emit("bot buttons", sendJson);
                            } else if (msg.type == "checkList") {
                                sendJson["message"] = msg["message"];
                                socket.emit("bot checkList", sendJson);
                            } else if (msg.type == "price") {
                                sendJson["message"] = msg["message"];
                                socket.emit("bot price", sendJson);
                            }
                        }
                        console.log("all messages sent");
                    }
                });
            } catch (error) {

                console.log(" ERROR IN SUB FUNCTION SEE THAT ");

                sendJson["message"] = ["Unable to process the question. Please rephrase it."];
                //  socket.emit("bot message", sendJson);
                console.log(error);
            }
        });
    });
}

function wordInString(s, word) {
    return new RegExp('\\b' + word + '\\b', 'i').test(s);
}

module.exports = {
    witProcessMessage: witProcessMessage

};
// bot testing mode
// http://stackoverflow.com/questions/6398196
if (require.main === module) {
    console.log("Bot testing mode.");
    const client = getWit();
    client.interactive();
}

//# sourceMappingURL=bot-compiled.js.map

//# sourceMappingURL=bot-compiled-compiled.js.map