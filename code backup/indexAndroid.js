'use strict';

const bodyParser = require('body-parser');
const express = require('express');
var moment=require('moment');

// get Bot, const, and Facebook API

const Helper = require('./helper.js');
const bot = require('./bot.js');
const Sessions = require('./sessions.js');
const Spell = require('./request.js');
const lContext =  require('./localContexts.js');
const global = require('./global.js');
const Messages = require('./messages.js');
const Search = require('./logics.js');
const Mappings = require('./mapping.js');
const db=require('./pushintodb.js');
const sentenceParser = require('./cleanSentence');


// Setting up our bot

// Starting our web server and putting it all together
const app = express();
app.use(bodyParser.json());

var server = require('http').createServer(app);
var port = 8885;

global.io =   require('socket.io')(server);

server.listen(port,function() {
  console.log("started socket successfully : " +  ":" + port);
});

// index. Let's say something fun
app.get('/', function(req, res) {
  res.send('"Only those who will risk going too far can possibly find out how far one can go." - T.S. Eliot');
});


global.io.on('connection',function(socket){
  var addedUser = false;
  console.log("New socket connection from user ");
//  console.log("socket id: ", socket.id);

  // new   user request from android
  socket.on('add user', function(data){

    console.log("Message on Add User: " ,data);
    if(addedUser)
      return;
    data = JSON.parse(data);
    var sessionId = data["session_id"];
    var socketId = socket.id;
    var deviceId = data["device_id"];

    Sessions.CreateSessionAndroid(sessionId,deviceId);
    global.storeUserSocket(sessionId,socket);
    socket.emit('bot login',{sessionCreated:true,sessionId:sessionId});

  });

  socket.on('reconnect user', function(data){

    console.log("Message on Reconnect User: " ,data);
    if(data  == null)
      return;

    data = JSON.parse(data);
    var sessionId = data["session_id"];
    var deviceId = data["device_id"];
    Sessions.CreateSessionAndroid(sessionId,deviceId);
    global.storeUserSocket(sessionId,socket);
   // socket.emit('bot login',{sessionCreated:true,sessionId:sessionId});

  });

  socket.on('dummy list', function(data){

    console.log("Message on dummy list: " ,data);

    data = JSON.parse(data);
    var sessionId = data["session_id"];

    var spec_sort = {"overall_score":"desc","price":"asc"};
    var query = undefined;
    var filter =  {"and":[{"range":{"price":{"gte":0,"lte":30000}}},{}]};
    var fields = Mappings.getFieldsAttribute("skuAndroid");

    var sendJson ={};
    Search.findSpecMobile(spec_sort,query,filter,fields, function (data) {
      var phone_list = data.hits.hits;
      console.log("length :" + phone_list.length);
      var list = [];
      for (var i = 0; i < phone_list.length; i++)
        list.push(phone_list[i]["fields"]);
      sendJson["username"] = "prodX";
      sendJson["message"] =  list;
      sendJson["relevant_attribute"] = [];
      socket.emit("bot list",sendJson);
    });
  });

  // new message came
  socket.on('user message',function(data){

    data = JSON.parse(data);
    console.log("=============New message received  to bot:============ " ,data);
    var sessionId = data.sessionId;
    var deviceId = data.deviceId;
    var socketId = socket.id;
    var email = data.email;

    if(!Sessions.isAndroidSessionExists(sessionId)){
      Sessions.CreateSessionAndroid(sessionId,deviceId);
      global.storeUserSocket(sessionId,socket);
    }

    var timestamp=moment().format('MMM DD, YYYY,h:mm:ss a');
    timestamp = (new Date).getTime();

    var details={'session_id':sessionId,'sender':sessionId,'content':data.message,'username':email,timestamp:timestamp};
    db.inserttodB(details,"chatapp_msg");

    var msg = sentenceParser.cleanSentence(data.message, function () {
      bot.witProcessMessage(sessionId, data.message,email,"android",{},function(result){
      });
    });

  });
});

function appendSendJson(key,value,json){
  json[key] = value;
}
