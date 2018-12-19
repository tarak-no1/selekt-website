var localContexts = [];

function isSessionExists(sessionId) {

    for (var i in localContexts) {
        if (localContexts[i]["sessionId"] == sessionId) return true;
    }
    return false;
}

function storeNewKey(sessionId, key, value) {
    "use strict";

    var i;
    for (i in localContexts) {
        if (localContexts[i]["sessionId"] == sessionId) break;
    }
    localContexts[i][key] = value;
}

function appendContext(sessionId, newContext) {
    "use strict";

    var i;
    for (i in localContexts) {
        if (localContexts[i]["sessionId"] == sessionId) break;
    }

    for (var key in newContext) {
        localContexts[i][key] = newContext[key];
    }
}

function createContext(sessionId) {
    "use strict";

    var obj = {};
    obj.sessionId = sessionId;
    obj.sessionVars = {};
    localContexts.push(obj);
}

function storeNewSessionKey(sessionId, key, value) {
    for (var i in localContexts) {
        if (localContexts[i]["sessionId"] == sessionId) break;
    }
    localContexts[i]["sessionVars"][key] = value;
}
function getSessionVarValue(sessionId, key) {

    var i;
    for (i in localContexts) {
        if (localContexts[i]["sessionId"] === sessionId) break;
    }
    return localContexts[i]["sessionVars"][key];
}
function userContext(sessionId) {
    "use strict";

    var i;
    for (i in localContexts) {
        if (localContexts[i]["sessionId"] === sessionId) break;
    }
    return localContexts[i];
}
function getValue(sessionId, key) {
    "use strict";

    var i;
    for (i in localContexts) {
        if (localContexts[i]["sessionId"] === sessionId) break;
    }
    return localContexts[i][key];
}
function deleteContext(sessionId, callback) {
    "use strict";

    var i;
    for (i in localContexts) {
        if (localContexts[i]["sessionId"] === sessionId) break;
    }
    delete localContexts[i];
    createContext(sessionId);

    callback && callback("cleared");
}
function deleteKey(sessionId, key) {
    "use strict";

    var i;
    for (i in localContexts) {
        if (localContexts[i]["sessionId"] === sessionId) break;
    }
    delete localContexts[i][key];
}

function deleteSessionKey(sessionId, key) {
    var i;
    for (i in localContexts) {
        if (localContexts[i]["sessionId"] === sessionId) break;
    }
    delete localContexts[i]["sessionVars"][key];
}
var sessionVariables = ["start_price", "end_price", "brand_pref", "spec_pref"];

/*
createContext("1234");
storeNewSessionKey("1234","start_price",20000);
var context = userContext("1234")
context.sessionVars.start_price = 23455;
console.log(context.sessionVars.start_price);

*/

module.exports = {
    isSessionExists: isSessionExists,
    storeNewKey: storeNewKey,
    createContext: createContext,
    userContext: userContext,
    getValue: getValue,
    deleteContext: deleteContext,
    deleteKey: deleteKey,
    appendContext: appendContext,
    storeNewSessionKey: storeNewSessionKey,
    getSessionVarValue: getSessionVarValue,
    deleteSessionKey: deleteSessionKey
};

//# sourceMappingURL=localContexts-compiled.js.map

//# sourceMappingURL=localContexts-compiled-compiled.js.map