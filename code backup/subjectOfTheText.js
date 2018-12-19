/**
 * Created by samba on 10/09/16.
 */
'use strict';

// Weather Example
// See https://wit.ai/sungkim/weather/stories and https://wit.ai/docs/quickstart
const Wit = require('node-wit').Wit;
const FB = require('./facebook.js');
const Config = require('./../config/const.js');
const Search = require('./logics.js');
const lContext =  require('./localContexts.js');
const Sessions = require('./sessions.js');
var http = require('http');
var Semantics = require('../semantics/check.js');
const  Messages = require('./messages.js');
const  witRequest = require('./request.js');
// const mongoDB = require('./mongodb/update_mongo.js');
var watson = require('watson-developer-cloud');
const Helper = require('./helper.js');
const Mappings = require('./mapping.js');
const functions = require('./functions.js');
const syntax = require('./syntaxAnalysis.js');
var async = require('async');
var winston = require('winston');

var message = "RAM of phones".toLowerCase();

var base_folder = "../node_modules/natural/lib/natural/brill_pos_tagger/data/English";
var rules_file = base_folder + "/tr_from_posjs.txt";
var lexicon_file = base_folder + "/lexicon_from_posjs.json";
var default_category = 'N';
var natural = require('natural');


syntax.analyzeSyntaxFromString(message,[], function (bucket, data) {
    var tokens = data["tokens"];
    // console.log(JSON.stringify(data,null,2));
    for(var i in tokens) {
        var token = tokens[i];
        if(token['partOfSpeech']["tag"] == 'VERB' ||
            token['partOfSpeech']["tag"] == 'PRON' ||
            token['partOfSpeech']["tag"] == 'DET'
        ) {
            // console.log("Question is about " + token['text']['content']);
            message = message.replace(token['text']['content'],"");
        }

        if(token['dependencyEdge']["label"] == 'NSUBJ') {
            // console.log("Question is about " + token['text']['content']);
            // return;
        }
    }
    message = message + " are";
    syntax.analyzeSyntaxFromString(message,[], function (bucket, data) {
        var tokens = data["tokens"];
        // console.log(JSON.stringify(data, null, 2));
        // console.log(message);
        for (var i in tokens) {
            var token = tokens[i];
            if (token['partOfSpeech']["tag"] == 'VERB' ||
                token['partOfSpeech']["tag"] == 'PRON'
            ) {
                // console.log("Question is about " + token['text']['content']);
                // message = message.replace(token['text']['content'], "");
            }

            if (token['dependencyEdge']["label"].indexOf("SUBJ") > -1) {
                console.log("Question is about " + token['text']['content']);
                return;
            }
        }
    });
});
