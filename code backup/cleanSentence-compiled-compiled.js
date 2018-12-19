/**
 * Created by samba on 20/08/16.
 */
const Spell = require('./request.js');
const Mappings = require('./mapping.js');

function cleanSentence(message, callback) {
    Spell.spellCheck(message, function (data) {
        if (data.Status === true) {
            message = data.reply_message.toLowerCase();
            message = message.replace("?", "");
            for (var key in Mappings.mapUnits) {
                var index = 0;
                index = message.indexOf(Mappings.mapUnits[key].toLowerCase());
                if (index >= 0) {
                    if (!isNaN(message[index - 1]) && message[index - 1] != " ") message = message.slice(0, index) + " " + message.slice(index);
                }
            }
        }
        callback(message);
    });
}

module.exports = {
    cleanSentence: cleanSentence
};

//# sourceMappingURL=cleanSentence-compiled.js.map

//# sourceMappingURL=cleanSentence-compiled-compiled.js.map