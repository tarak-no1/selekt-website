'use strict';

// See the Send API reference
// https://developers.facebook.com/docs/messenger-platform/send-api-reference

const request = require('request');
const Config = require('./../config/const.js');

const fbReq = request.defaults({
  uri: 'https://graph.facebook.com/me/messages',
  method: 'POST',
  json: true,
  qs: {
    access_token: Config.FB_PAGE_TOKEN
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

const fbMessage = function (recipientId, msg, cb) {
  const opts = {
    form: {
      recipient: {
        id: recipientId
      },
      message: {
        text: msg
      }
    }
  };

  fbReq(opts, function (err, resp, data) {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};

const fbImageMessage = function (recipientId, msg, cb) {
  const opts = {
    form: {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: "image",
          payload: {
            url: "http://instomeal.com/static/chef_photos/10.jpg"
          }
        }

      }
    }
  };

  fbReq(opts, function (err, resp, data) {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};

const fbButtonMessage = function (recipientId, msg, cb) {
  const opts = {
    form: {
      recipient: {
        id: recipientId
      },
      message: {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "button",
            "text": msg,
            "buttons": [{
              "type": "web_url",
              "url": "https://petersapparel.parseapp.com",
              "title": "Show Website"
            }, {
              "type": "postback",
              "title": "Start Chatting",
              "payload": "Chatting"
            }]
          }
        }
      }
    }
  };

  fbReq(opts, (err, resp, data) => {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};
// horizontal scroll msg
const fbGenericMessage = (recipientId, elements, cb) => {
  const opts = {
    form: {
      recipient: {
        id: recipientId
      },
      "message": {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": elements
          }
        }
      }
    }
  };

  fbReq(opts, (err, resp, data) => {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};

// See the Webhook reference
// https://developers.facebook.com/docs/messenger-platform/webhook-reference
const getFirstMessagingEntry = body => {
  const val = body.object === 'page' && body.entry && Array.isArray(body.entry) && body.entry.length > 0 && body.entry[0] && body.entry[0].messaging && Array.isArray(body.entry[0].messaging) && body.entry[0].messaging.length > 0 && body.entry[0].messaging[0];

  return val || null;
};

module.exports = {
  getFirstMessagingEntry: getFirstMessagingEntry,
  fbMessage: fbMessage,
  fbReq: fbReq,
  fbImageMessage: fbImageMessage,
  fbButtonMessage: fbButtonMessage,
  fbGenericMessage: fbGenericMessage
};

//# sourceMappingURL=facebook-compiled.js.map

//# sourceMappingURL=facebook-compiled-compiled.js.map