var request = require("request");
const baseURL =  'https://api.wit.ai';
const Config = require('./../config/const.js');
const token = Config.WIT_TOKEN;
const headers = {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};



function getOptions(qs) {
    return {
        method: 'GET',
        url: baseURL + '/message?' + qs,
        headers: headers
    }
}

function witMessageAPI(message, context, cb){
	console.log(message);
    if (typeof context === 'function') {
        cb = context;
        context = undefined;
    }
    let qs = 'q=' + encodeURIComponent(message);
    if (context) {
        qs += '&context=' + encodeURIComponent(JSON.stringify(context));
    }

    request(getOptions(qs), function (error, response, body) {
        if (!error && response.statusCode == 200) {
                    // Show the HTML for the Modulus homepage.
            cb(body);
        }
        else{
            console.log("error occurred");
        }
    });
}

module.exports = {
    witMessageAPI:witMessageAPI
};