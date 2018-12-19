var request = require('request');
var consts = require('./../config/const.js');
function spellCheck(msg, callback) {
    request.post('http://172.31.17.225:1234/app1/spelling', { form: { message: msg } }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.parse(body);
            callback && callback(body);
        }
    });
}
//spellCheck("hi");

const baseURL = 'https://api.wit.ai';
const headers = {
    'Authorization': 'Bearer ' + consts.WIT_TOKEN,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

function converseWit(context, message, sessionId, callback) {

    "use strict";

    var qs = 'session_id=' + sessionId;
    qs += '&v=20160526';
    if (message) {
        qs += '&q=' + encodeURIComponent(message);
    }
    console.log(baseURL + '/converse?' + qs);
    request({
        url: baseURL + '/converse?' + qs,
        method: 'POST',
        headers: headers,
        body: JSON.stringify(context)
    }, function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            console.log(response.statusCode, body);
            callback && callback(body);
        }
    });
}

/*
var sample_context = {best : "best"};
var sessionId= "123abc";
var msg ="best phone under 30k"
converseWit(sample_context,msg,sessionId);
*/

module.exports = {
    spellCheck: spellCheck,
    converseWit: converseWit
};

//curl -XPOST 'https://api.wit.ai/converse?session_id=123abc&q=best%20phone%20under%2030k' -H "Content-Type: application/json" -H "Accept: application/json" -H 'Authorization: Bearer QYX4NYOZRG3BJR6AX6RXU4QU4W5X67FZ'

//# sourceMappingURL=request-compiled.js.map

//# sourceMappingURL=request-compiled-compiled.js.map