/**
 * Created by samba on 23/11/16.
 */
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: 'https://search-selekt-aqwmdoox6joufyn4cg5m3xok4m.ap-southeast-1.es.amazonaws.com'
});

function runQuery(query, callback) {
    // console.log(JSON.stringify(query,null,2));
    query.requestTimeout = 60000;
    client.search(query).then(function (resp) {
        var hits = resp.hits.hits;
        callback && callback(hits,resp.hits.total,null);
    }, function (err) {
        console.log(err);
        console.log(JSON.stringify(query,null,2));
        callback && callback(null,null,err);
    });
}

module.exports = {
    runQuery:runQuery
};
