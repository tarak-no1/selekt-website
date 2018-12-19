'use strict';

// Messenger API integration example
// We assume you have:
// * a Wit.ai bot setup (https://wit.ai/docs/quickstart)
// * a Messenger Platform setup (https://developers.facebook.com/docs/messenger-platform/quickstart)
// You need to `npm install` the following dependencies: body-parser, express, request.

const bodyParser = require('body-parser');
const express = require('express');
var moment = require('moment');

// get Bot, const, and Facebook API
const bot = require('./bot.js');
const Config = require('./../config/const.js');
const FB = require('./facebook.js');
const Sessions = require('./sessions.js');
const sentenceParser = require('./cleanSentence');
const lContext = require('./localContexts.js');
const db = require('./pushintodb.js');

// Web server parameter
const PORT = process.env.PORT || 8889;

// Starting our webserver and putting it all together
const app = express();
app.set('port', PORT);
app.listen(app.get('port'));
app.use(bodyParser.json());
console.log("I'm wating for you @" + PORT);

// index. Let's say something fun
app.get('/', function (req, res) {
  res.send('"Only those who will risk going too far can possibly find out how far one can go." - T.S. Eliot');
});

// Webhook verify setup using FB_VERIFY_TOKEN
app.get('/webhook', function (req, res) {
  if (!Config.FB_VERIFY_TOKEN) {
    throw new Error('missing FB_VERIFY_TOKEN');
  }
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === Config.FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.get('/version', function (req, res) {
  var obj = {};
  obj["version"] = 20;
  var stencilMessages = [];
  stencilMessages.push({ sender: "user", message: " You: Hi" });
  stencilMessages.push({ sender: "prodx", message: "ProdX: Hello" });
  stencilMessages.push({ sender: "user", message: "You: I need a phone" });
  stencilMessages.push({ sender: "prodx", message: "ProdX: Before showing you the results," + " let me ask you three simple questions to know your preferences better." });
  stencilMessages.push({ sender: "prodx", message: "ProdX: what is the price range you are looking for ?" });
  stencilMessages.push({ sender: "user", message: "You: around 20 thousand" });
  stencilMessages.push({ sender: "prodx", message: "ProdX: I have got 14 phones in this price range" + "1. Sony(3)\n" + "2. HTC Mobiles(3)\n" + "3. Samsung(2)\n" + "4. One plus(2)\n" + "5. Apple(1)\n" + "6. Lenovo(1)\n" + "7. Google Mobile(1)\n" + "8. Motorola(1)\n" + "If you want to filter out any of these brands, just type the corresponding number or type '0' to skip." });
  stencilMessages.push({ sender: "user", message: "You: 6 7  1" });
  stencilMessages.push({ sender: "prodx", message: "ProdX: Which of the following features is most important" + " to you ? Pick the corresponding number." + "1. Camera\n" + "2. Display\n" + "3. Battery\n" + "4. RAM\n" + "5. All" });
  stencilMessages.push({ sender: "user", message: "You: 1" });
  stencilMessages.push({ sender: "prodx", message: "ProdX: list size: 9: " + "Results are sorted based on camera specifications and expert camera reviews." + "See below for your recommendations" });
  stencilMessages.push({ sender: "user", message: "You: compare phones 1 and 2" });
  stencilMessages.push({ sender: "prodx", message: "ProdX: By comparing the specification scores from 'buysmaart.com' for both of these mobiles, Apple iPhone 5s seems to be better than" + " HTC Mobiles Desire 828 Dual SIM. See below for more details" });
  stencilMessages.push({ sender: "user", message: "You: what's the ram of oneplus two" });
  stencilMessages.push({ sender: "prodx", message: "ProdX: 4 GB" });
  stencilMessages.push({ sender: "user", message: "You: Compare Moto X and oneplus two" });
  stencilMessages.push({ sender: "prodx", message: "ProdX: By comparing the specification scores from 'buysmaart.com' for both of these mobiles, Oneplus two seems to be better than Motorola Moto X Play 32 GB." + "See below for more details" });
  stencilMessages.push({ sender: "user", message: "You: show me full details of oneplus two" });

  obj["messages"] = stencilMessages;
  res.send(obj);
});

app.get('/intro1', function (req, res) {
  var obj = {};
  obj["title"] = " What is ProdX?";
  var introPointers = [];
  introPointers.push("Suggest phones for my daughter");
  introPointers.push("Mobiles popular for gaming under 15k");
  introPointers.push("Phones that can take awesome selfies");
  introPointers.push("Mobile that charge fast");
  obj["messages"] = introPointers;
  res.send(obj);
});

app.get('/intro2', function (req, res) {
  var obj = {};
  obj["title"] = " How it works?";
  var introPointers = [];
  introPointers.push("Type your query in the chat window in simple sentences");
  introPointers.push("Scroll up and you can browse through the results");
  introPointers.push("Use prompts to see the popular questions");
  introPointers.push("Type 'clear' to start a new chat session");
  obj["messages"] = introPointers;
  res.send(obj);
});

app.get('/intro3', function (req, res) {
  var obj = {};
  obj["title"] = " What all can it do?";
  var introPointers = [];
  introPointers.push("Recommend a List of mobile phones based on your requirements, purpose and budget");
  introPointers.push("Features of any particular model");
  introPointers.push("Meaning and definitions of mobile terminologies (eg. What is RAM ?)");
  introPointers.push("Compare features of two mobiles and recommend the better one");
  introPointers.push("Expert reviews");
  obj["messages"] = introPointers;
  res.send(obj);
});

app.get('/introMessages', function (req, res) {
  var list = [];

  var obj = {};
  obj["title"] = " What is ProdX?";
  obj["page"] = "first";
  var introPointers = [];
  introPointers.push("Suggest phones for my daughter");
  introPointers.push("Mobiles popular for gaming under 15k");
  introPointers.push("Phones that can take awesome selfies");
  introPointers.push("Mobile that charge fast");
  obj["messages"] = introPointers;
  list.push(obj);

  var obj = {};
  obj["title"] = " How it works?";
  obj["page"] = "second";
  var introPointers = [];
  introPointers.push("Type your query in the chat window in simple sentences");
  introPointers.push("Scroll up and you can browse through the results");
  introPointers.push("Use prompts to see the popular questions");
  introPointers.push("Type 'clear' to start a new chat session");
  obj["messages"] = introPointers;
  list.push(obj);

  var obj = {};
  obj["title"] = " What all can it do?";
  obj["page"] = "third";

  var introPointers = [];
  introPointers.push("Recommend a List of mobile phones based on your requirements, purpose and budget");
  introPointers.push("Features of any particular model");
  introPointers.push("Meaning and definitions of mobile terminologies (eg. What is RAM ?)");
  introPointers.push("Compare features of two mobiles and recommend the better one");
  introPointers.push("Expert reviews");
  obj["messages"] = introPointers;
  list.push(obj);

  var obj = {};
  obj["title"] = "What it cannot do?";
  obj["page"] = "fourth";

  var introPointers = [];
  introPointers.push("Avoid using combined sentences \n   eg: I want phones around 10k but with a 13 MP camera");
  introPointers.push("Do not use negative words \n  eg: Don�t, doesn't, can't, not");
  introPointers.push("Rephrase your question in case ProdX doesn�t give you an expected response");
  introPointers.push("    You: How's Oneplus one?");
  introPointers.push("    ProdX: I'm not able to understand that.");
  introPointers.push("    You: Review of Oneplus one");
  introPointers.push("    ProdX: Oneplus one is a very good phone that comes at a very affordable price ...");
  obj["messages"] = introPointers;
  list.push(obj);

  res.send(obj);
});

function witFunction(sessionId, msg) {

  bot.witProcessMessage(sessionId, msg, sessionId, "fb", {}, function (result) {});
}
// The main message handler
app.post('/webhook', function (req, res) {
  // Parsing the Messenger API response
  const messaging = FB.getFirstMessagingEntry(req.body);

  if (messaging.postback) {
    console.log("postback occurred");
    var text = JSON.stringify(messaging.postback);
    console.log(text);
  }

  if (messaging && messaging.message) {

    // Yay! We got a new message!

    // We retrieve the Facebook user ID of the sender
    const sender = messaging.sender.id;

    // We retrieve the user's current session, or create one if it doesn't exist
    // This is needed for our bot to figure out the conversation history
    const sessionId = Sessions.findOrCreateSession(sender);

    // We retrieve the message content
    var msg = messaging.message.text;
    const atts = messaging.message.attachments;

    var timestamp = moment().format('MMM DD, YYYY,h:mm:ss a');
    timestamp = new Date().getTime();

    // db.inserttodB({'name':sender},'chatapp_user');
    var details = { 'session_id': sessionId, 'sender': sender, 'content': msg, 'username': sessionId, timestamp: timestamp };
    db.inserttodB(details, "chatapp_msg");

    if (!lContext.isSessionExists(sessionId)) lContext.createContext(sessionId);
    var localContext = lContext.userContext(sessionId);

    if (atts) {
      // We received an attachment
      // Let's reply with an automatic message
      FB.fbMessage(sender, 'Sorry I can only process text messages for now.');
    } else if (msg) {
      // We received a text message
      // message may have typos check them
      sentenceParser.cleanSentence(msg, function (clean_message) {
        console.log("Cleaned messaged : " + JSON.stringify(clean_message));
        witFunction(sessionId, clean_message);
      });
    }
  }
  res.sendStatus(200);
});

//# sourceMappingURL=index-compiled.js.map

//# sourceMappingURL=index-compiled-compiled.js.map