/**
 * Created by samba on 13/01/17.
 */

const elasticSearch = require('./elasticSearch.js');
let feed_attributes = {};
function get_product_line_filters(product_line, callback) {
    let attribute_value_list_query = {
        index: "styling_rules",
        type: "product_line_filters",
        body: {
            query: {
                bool: {
                    filter: [
                        {
                            match_phrase:
                            {
                                product_line_name: product_line
                            }
                        }
                    ]
                }
            }
        },
        size: 300
    };

    console.log("Getting filters for "+product_line);
    elasticSearch.runQuery(attribute_value_list_query,function (result,total) {
        result = result.sort(function(a, b) {
            a._id = parseInt(a._id);
            b._id = parseInt(b._id);
            return a["_id"] - b["_id"];
        });
        let filter_options = []
        for(let i in result) {
            let attribute = result[i]["_source"];
            let attribute_name = attribute["product_line_attribute_db_path"].split(".").slice(-1)[0];
            let attribute_value_list = attribute['product_line_attribute_value_list'];
            let option = {
                "key" : attribute_name,
                "display_name" : attribute["product_line_attribute"],
                "values" : attribute_value_list.sort()
            }
            filter_options.push(option);
        }
        callback(filter_options);
    });
}

function get_feedback_attributes(product_line,callback)
{
    let query =
    {
        index:"styling_rules",
        type : "adjectives_rules",
        body:
        {
            "query":{"match_phrase":{"product_line_name":product_line}},
            size:100
        }
    };
    elasticSearch.runQuery(query,function (results,total,err) {
        if(err==null)
        {
            console.log(total);
            for(let i in results)
            {
                let source = results[i]["_source"];
                if(source["adjective_name"]==source["adjective_value"])
                {
                    let dependencies = source["attribute_dependencies"];
                    for(let j in dependencies)
                    {
                        let attribute = dependencies[j].attribute_type;
                        if(!feed_attributes.hasOwnProperty(attribute))
                            feed_attributes[attribute] = [];
                        if(feed_attributes[attribute].indexOf(source["adjective_name"])==-1)
                            feed_attributes[attribute].push(source["adjective_name"]);
                    }
                }
            }
            callback(Object.keys(feed_attributes));
        }
    })
}
function get_feed_attribute()
{
    return feed_attributes;
}
function get_adjective_products(productLine,adjective,callback)
{
    let query=
    {
        index: "styling_rules",
        type: "adjectives_rules",
        body:
        {
            query:
            {
                bool: {
                    must: [
                        {
                            match_phrase: {"product_line_name": productLine}
                        },
                        {
                            match_phrase: {"adjective_name": adjective}
                        },
                        {
                            match_phrase: {"adjective_value": adjective}
                        }
                    ]
                }
            }
        }
    };
    elasticSearch.runQuery(query,function (data,total,error) {
        if(error==null)
        {
            console.log("Got Adjective");
            let source = data[0]["_source"];
            let dependencies = source["attribute_dependencies"];
            let output = {};
            for(let i in dependencies)
            {
                output[dependencies[i].attribute_type] = dependencies[i].attribute_value;
            }
            callback(output);
        }
    })
}
module.exports = {
    get_product_line_filters : get_product_line_filters,
    get_feedback_attributes : get_feedback_attributes,
    get_feed_attribute:get_feed_attribute,
    get_adjective_products:get_adjective_products
}
