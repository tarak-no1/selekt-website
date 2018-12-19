'use strict';

//helper functions
const firstEntityValue = function(entities, entity){
    const val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity][0].value;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};

function extractEntities(entities) {
    // Broad category
    let keys = Object.keys(entities);
    let new_entities = {};

    for(let i in keys) {
        let entity = keys[i];
        const val = entities &&
            Array.isArray(entities[entity]) &&
            entities[entity].length > 0 &&
            entities[entity];
        if (!val) {
            return null;
        }
        let entity_values = [];
        for(let j in val) entity_values.push(val[j].value);
        new_entities[entity] = entity_values;
    }
    return new_entities;

}
function random(low, high) {
    return Math.round(Math.random() * (high - low) + low);
}
module.exports = {
    random:random,
    extractEntities: extractEntities,
};

//# sourceMappingURL=helper-compiled.js.map