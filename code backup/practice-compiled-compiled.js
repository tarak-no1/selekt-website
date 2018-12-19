'use strict';

const Wit = require('node-wit').Wit;
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
const syntax = require('./syntaxAnalysis.js');
var async = require('async');
var winston = require('winston');

var entity_list = { "mobile": [{ "confidence": 1, "type": "value", "value": "phones" }], "RAM": [{ "confidence": 0.9936013200698559, "type": "value", "value": 3 }], "units": [{ "confidence": 1, "type": "value", "value": "GB" }], "attribute": [{ "confidence": 0.9944838532804616, "type": "value", "value": "RAM" }], "price_range": [{ "confidence": 0.9261851434184944, "type": "value", "value": "under" }] };

console.log(Helper.allEntityValue(entity_list, "RAM"));

//# sourceMappingURL=practice-compiled.js.map

//# sourceMappingURL=practice-compiled-compiled.js.map