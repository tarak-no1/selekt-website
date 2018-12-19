'use strict';
// get Bot, const, and Facebook API
// Setting up our bot
// Starting our web server and putting it all together

const bodyParser = require('body-parser');
const express = require('express');
const bot = require('./bot.js');
const Sessions = require('./sessions.js');
const global = require('./global.js');
const elasticSearch = require('./elasticSearch.js');
const filterList = require('./filter-list.js');
const website = require('./website.js');
const mysql = require("mysql");
let db_config = {
    host : 'localhost',
    user : 'root',
    password : 'selekt.in',
    database : 'prodx'
};
let connection;
function handleDisconnect() {
    connection = mysql.createConnection(db_config);
    connection.connect(function(err) {
        if(err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

const app = express();
var server = require('http').createServer(app);
var port = 2222;
global.io = require('socket.io')(server);

server.listen(port, function () {
    console.log("started socket successfully : " + ":" + port);
});
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});
// index. Let's say something fun
app.get('/', function (req, res) {
    res.send('"Only those who will risk going too far can possibly find out how far one can go." - T.S. Eliot');
});
/*app.get('/web_message/:session_id/:message/:from/',function(req,res)
    {  
        let data = req.params;
        console.log("=============New message from website through API:============ ", data);
        let sessionId = data['session_id'];
        let message = data["message"];
        let from = Number(data["from"]);
        //create session if doesn't exist
        if (!Sessions.isAndroidSessionExists(sessionId)) {
            Sessions.CreateSessionAndroid(sessionId);
            global.storeUserSocket(sessionId, socket);
        }
        //sending to wit
        if(from==0)
        {
            message = message.replace(/-/g," ");
            bot.witProcessMessage({}, sessionId, message,"website");
        }
        
        website.webProcessMessage(sessionId, message, from,function(result,benefits)
        {
            console.log("Sending Response through api call\n");
            res.send({"product_list":result,"benefits":benefits});
        });
    });*/
global.io.on('connection', function (socket) {
    console.log("New socket connection from user ");
    //  console.log("socket id: ", socket.id);
    // new user request from android
    socket.on('add user', function (data) {
        console.log("Message on Add User: ", data);
        data = JSON.parse(data);
        let sessionId = data["session_id"];
        let deviceId = data["device_id"];
        let username = data["user_name"];
        if(!Sessions.isAndroidSessionExists(sessionId)) {
            Sessions.CreateSessionAndroid(sessionId, deviceId);
            //Sending suggestion message to user
            let message = {
                type:'text',
                message:
                'Welcome to Selekt, share your needs in the following manner' +
                    '\n\n\t1. Selekt jeans'+
                '\n\t2. Selekt dresses for wedding under 5000' +
                '\n\t3. Selekt white and red dresses for party under 2000'
            };
            
            if(!data["status"])
            {
                socket.emit('chat',message);
                socket.emit("chat",{"type":"text","message":"What do you want to shop today?"});
            }
            let query = "INSERT INTO chatapp_user(name)values('"+sessionId+"');";
            save_history(query);
            
        }
        global.storeUserSocket(sessionId, socket);

        //getting inspirations
        get_inspirations(function(slides_true,slides_false)
        {
            let data =
            {
                type:"inspirations",
                slides_true : slides_true,
                slides_false : slides_false
            };
            console.log("sending Inspirations");
            socket.emit("browse",data);

        });

        //sending login success message to user
        socket.emit('bot login', { sessionCreated: true, sessionId: sessionId });

    });

    // new message came
    socket.on('user message', function (data)
    {
        data = JSON.parse(data);
        console.log("=============New message received  to bot:============ ", data);
        let sessionId = data['session_id'];
        let deviceId = data["device_id"];

        //create session if doesn't exist
        if (!Sessions.isAndroidSessionExists(sessionId)) {
            Sessions.CreateSessionAndroid(sessionId);
            global.storeUserSocket(sessionId, socket);
        }

        let user_profile = {};
        if(data["body_shape"]!=undefined)
            user_profile.body_shape = data["body_shape"];
        if(data["skin_color"]!=undefined)
            user_profile.skin_color = data["skin_color"];
        try{
            user_profile.age = getAge(data["age"]);
            user_profile.height = getHeight(data["height"]);
        }catch(e){}
        //sending to wit
        bot.witProcessMessage(user_profile, sessionId, data.message.replace("-"," "));
    });
    //No need of Wit message came
    socket.on("user answers",function(data)
    {
        data = JSON.parse(data);
        console.log("============= New Answer Got From User:============");
        console.log(JSON.stringify(data,null,2));
        console.log("====================================================");

        let sessionId = data['session_id'];
        let deviceId = data["device_id"];

        //Checking Session is Exists or not
        if (!Sessions.isAndroidSessionExists(sessionId)) {
            Sessions.CreateSessionAndroid(sessionId);
            global.storeUserSocket(sessionId, socket);
        }

        let user_profile = {};
        if(data["body_shape"]!=undefined)
            user_profile.body_shape = data["body_shape"];
        if(data["skin_color"]!=undefined)
            user_profile.skin_color = data["skin_color"];
        if(data["height"]!=undefined)
            user_profile.height = data["height"];
        if(data["age"]!=undefined)
            user_profile.age = data["age"];
        //Taking context based on the sessionID
        let context = Sessions.getContext(sessionId);
        context.from = 0;
        if(data["type"]=="inspiration")
        {
            console.log("Got inspiration Id");
            let from = data["from"];
            get_insp_by_id(data["id"],function(result)
            {
                //Getting products from the inspiration
                get_products(result["_source"],from,function(resp,total_length)
                {
                    console.log("sending Inspiration Results");
                    console.log("length : "+resp.length);
                    let product_data = {};
                    product_data.type = "product_list";
                    product_data.parent = "inspiration";
                    product_data.current_page = 0;
                    product_data.total_length = total_length;

                    product_data.list = resp;
                    socket.emit("browse", product_data);

                    let tag_data = {};
                    tag_data.type = "tag_list";
                    tag_data.list = {};
                    tag_data.list.list_tags = [];
                    tag_data.list.recommended_tags = [];
                    //sending tags to user
                    socket.emit("browse", tag_data);

                    filterList.get_product_line_filters(resp[0]["product_line"], function (products) {
                        let data = {};
                        data.type = "filter_list";
                        data.options = products;
                        data.applied_filters = [];
                        //sending filters to user
                        socket.emit("browse",data);
                    });
                });
            });
        }
        else if(data["type"]=="filters")
        {
            console.log("Got Filters Type");
            context.is_flow_complete = false;
            bot.update_filterlist(user_profile,sessionId,data["filter_list"]);
        }
        else if(data["type"]=="tags")
        {
            console.log("Got Tags");
            context.is_flow_complete = false;
            let action = data["action"];
            let tag_value = data["tag_value"];
            if(action=="remove")
            {
                for(let k in tag_value)
                {
                    let attribute = tag_value[k].key;
                    let values = tag_value[k].values;
                    for(let j in values)
                    {
                        for(let rem in context.benefits)
                        {
                            if(context.benefits[rem].type==attribute && context.benefits[rem].value==values[j])
                                context.benefits.splice(rem,1);
                        }
                        context.remove_tags.push({"key":attribute,"value":values[j]});
                    }
                }
            }
            else
            {
                for(let k in tag_value)
                {
                    let attribute = tag_value[k].key;
                    let values = tag_value[k].values;
                    for(let j in values)
                    {
                        let rm_tags = context.remove_tags;
                        for(let rem in rm_tags)
                        {
                            if(rm_tags[rem].key==attribute && rm_tags[rem].value==values[j])
                                context.remove_tags.splice(rem,1);
                        }
                        context.benefits.push({"type":attribute,"value":values[j]});
                    }
                }
            }
            Sessions.storeContext(sessionId,context);
            bot.fetch_Products(user_profile,sessionId);
        }
        else if(data["type"]=="show_more")
        {
            context.from = data["page_no"];
            Sessions.storeContext(sessionId,context);
            bot.fetch_Products(context.user_profile,sessionId);
        }
        else if(data["type"]=="undo")
        {
            let question_type = data["type_of_question"];
            let question = data["user_msg"];
            let prev_question_type = data["prev_question_type"];
            let prev_user_msg = data["prev_user_msg"];
            bot.get_previous_question_state(user_profile,sessionId,question_type,question,prev_question_type,prev_user_msg);
        }
        else if(data["type"]=="answer")
        {
            bot.answerTypeMessages(user_profile, sessionId, data["keys"], "result");
        }
    });
    socket.on("auto_complete_input",function(data)
    {
        console.log(data);
        let suggest = {};
        let query =
        {
            index:"auto_complete",
            type:"auto_complete",
            body:
            {
                query:
                {
                    "bool":
                    {
                        "should":
                        [
                            {"match_phrase":{"query": data["msg"]}},
                            {"match":{"entities": data["msg"]}}
                        ]
                    }
                }
            }
        };
        let output = [];
        elasticSearch.runQuery(query,function(result,total)
        {
            for(let i in result)
            {
                output.push(result[i]._source.query);
                if(output.length==5)
                {
                    break;
                }
            }
            suggest.suggest_msg = output;
            socket.emit("auto_complete_output",suggest);
        });
    });
     socket.on("web",function(data)
    {
        data = JSON.parse(data);
        console.log("=============New message from website:============ ", data);
        let sessionId = data['session_id'];
        let deviceId = data["device_id"];
        let message = data["message"];
        let from = data["from"];
        if(from==0 || from==undefined)
            bot.witProcessMessage({}, sessionId, message,"website");
         //create session if doesn't exist
        if (!Sessions.isAndroidSessionExists(sessionId)) {
            Sessions.CreateSessionAndroid(sessionId);
            global.storeUserSocket(sessionId, socket);
        }
        website.webProcessMessage(sessionId, message, from);
        //sending to wit
        
    });
    /*socket.on("question",function(data)
    {
        data = JSON.parse(data);
        console.log("================== Question Channel ====================");
        console.log(data);
        let sessionId = data['session_id'];
        let message = data["message"];
        website.getEntities(message.toLowerCase(),sessionId,function(entities)
        {
            let msg = "na";
            if(entities.hasOwnProperty("product_line"))
            {
                if(entities.hasOwnProperty("broad_occasion"))
                    msg = "What "+entities["product_line"]+" to wear for "+entities["broad_occasion"];
                if(entities.hasOwnProperty("occasion"))
                {
                    msg = "What "+entities["product_line"]+" to wear for "+entities["occasion"];
                }
            }
            let question =
            {
                "type":"question",
                "question": msg
            };
            console.log("sending Question",question);
            socket.emit("chat",question);
        });
    });*/
});
function get_products(result, from, callback)
{
    console.log("===========Inspiration PRoducts =================");
    console.log(JSON.stringify(result,null,2));
    let total_results = [];
    let product_line = result["product_line"];
    let min_price = result["min_price"];
    let max_price = result["max_price"];
    let occasion = result["occasion"];
    let key = result["attributes"][0].key[0];
    let value = result["attributes"][0].value[0];

    let query =
     {
        "index": 'products_data',
        "type": product_line,
        "body":
        {"query":{"bool":{"must":[]}},"from":from*60,size:60}
     };

    if(product_line!="na" && occasion!="na")
    {
        query.body.query.bool.must.push({match_phrase:{"product_filter.occasion" : occasion}});
    }
    else if(key!="na" && value!="na")
    {
        let attribute = "product_filter."+key;
        let json_query = {};
        json_query[attribute] = value;
        query.body.query.bool.must.push({match_phrase:json_query});
        if(min_price!="na" && max_price!="na")
        {
            query.body.query.bool.must.push({"range":{"product_filter.discount_price":{"gte":min_price,"lte":max_price}}});
        }
    }
    else if(min_price!="na" && max_price!="na")
    {
        query.body.query.bool.must.push({"range":{"product_filter.discount_price":{"gte":parseInt(min_price),"lte":parseInt(max_price)}}});
    }
    elasticSearch.runQuery(query,function(result_set,total,err)
    {
        console.log("Total length :",total);
        if(err==null)
        {
            for(let k in result_set)
            {
                var source = {};
                var result = result_set[k];
                source["product_line"] = product_line;
                source["_id"] = result["_id"];
                source["product_filter"] = result["_source"]["product_filter"];
                source["style_image"] = result["_source"]["style_image"];
                source["landingPageUrl"] = result["_source"]["pdpData"]["landingPageUrl"];
                source["product_benefits"] = [];
                try
                {
                    for(let pro_benefit in result["_source"]["benefits"])
                    {
                        let name = functions.benefit_name[product_line][result["_source"]["benefits"][pro_benefit]];
                        if(source["product_benefits"].indexOf(name)==-1 && name!="")
                        {
                            source["product_benefits"].push(name);
                        }
                    }
                }catch(e){}
                source["benefits"] = [];
                if(source["style_image"]==undefined)
                {
                    source["style_image"] = result._source.style_images;
                }
                //getting least size image url
                let resolutions = function(source)
                {
                    let image_url;
                    try{
                        image_url = source["imageURL"];
                        let image_resolutions = source["resolutions"];
                        let res_keys = Object.keys(image_resolutions);
                        let min_pixels = parseInt(res_keys[0].split("X")[0]);

                        for(let res in res_keys)
                        {
                            let pixel = parseInt(res_keys[res].split("X")[0]);
                            if(pixel>=360 && pixel<min_pixels)
                            {
                                min_pixels = pixel;
                                image_url = image_resolutions[res_keys[res]];
                            }
                        }
                    }catch (e){}
                    return image_url;
                };

                var main_image_url,front_image_url,back_image_url,right_image_url,left_image_url;

                if(source["style_image"].hasOwnProperty("search"))
                    main_image_url = resolutions(source["style_image"]["search"]);

                if(source["style_image"].hasOwnProperty("front"))
                    front_image_url = resolutions(source["style_image"]["front"]);

                if(source["style_image"].hasOwnProperty("back"))
                    back_image_url = resolutions(source["style_image"]["back"]);

                if(source["style_image"].hasOwnProperty("right"))
                    right_image_url = resolutions(source["style_image"]["right"]);

                if(source["style_image"].hasOwnProperty("left"))
                    left_image_url = resolutions(source["style_image"]["left"]);

                source["style_image"] = {};
                source["style_image"]["search"] = {};
                if(main_image_url!=undefined)
                {
                    source["style_image"]["search"]["imageURL"] = main_image_url;
                }
                if(left_image_url!=undefined)
                {
                    source["style_image"]["left"] = {};
                    source["style_image"]["left"]["imageURL"] = left_image_url;
                    if(source["style_image"]["search"]["imageURL"]==undefined)
                        source["style_image"]["search"]["imageURL"] = left_image_url;
                }
                if(right_image_url!=undefined)
                {
                    source["style_image"]["right"] = {};
                    source["style_image"]["right"]["imageURL"] = right_image_url;
                    if(source["style_image"]["search"]["imageURL"]==undefined)
                        source["style_image"]["search"]["imageURL"] = right_image_url;
                }
                if(front_image_url!=undefined)
                {
                    source["style_image"]["front"] = {};
                    source["style_image"]["front"]["imageURL"] = front_image_url;
                    if(source["style_image"]["search"]["imageURL"]==undefined)
                        source["style_image"]["search"]["imageURL"] = front_image_url;
                }
                if(back_image_url!=undefined)
                {
                    source["style_image"]["back"] = {};
                    source["style_image"]["back"]["imageURL"] = back_image_url;
                    if(source["style_image"]["search"]["imageURL"]==undefined)
                        source["style_image"]["search"]["imageURL"] = back_image_url;
                }
                total_results.push(source);
            }
        }
        callback(total_results,total);
    });
}
function appendSendJson(key, value, json) {
    json[key] = value;
}
var insp_ids =
[
    7,26,34,49,101,125,137,146,159,178,182
];

function get_inspirations(callback)
{
    let count = 0;
    let slides_true = [];
    let slides_false = [];
    for(let i in insp_ids)
    {
        get_insp_by_id(insp_ids[i],function(data)
        {
            count++;
            if(data["_source"]["slide"])
            {
                slides_true = slides_true.concat(data);
            }
            else
            {
                slides_false = slides_false.concat(data);
            }
            if(count==insp_ids.length)
            {
                callback(slides_true,slides_false);
            }
        });
    }

}
function get_insp_by_id(id,callback)
{
    let query = {
        index: 'styling_rules',
        type: 'inspiration_tiles',
        body: {
            query:
            {
                match_phrase:{"_id":""+id}
            }
        }
    };
    elasticSearch.runQuery(query,function (res,total)
    {
        let jsonResult = {};
        jsonResult["id"] = res[0]["_id"];
        jsonResult["heading"] = res[0]["_source"]["inspiration_name"];
        jsonResult["sub_heading"] = "";

        jsonResult["imageUrl"] = res[0]["_source"]["image"];
        if(jsonResult["imageUrl"]==undefined)
            jsonResult["imageUrl"] = "http://assets.myntassets.com/assets/images/1263585/2016/4/6/11459930369265-bebe-Coral-Orange-Sequinned-Swarovski-Elements-Maxi-Dress-5551459930366199-1.jpg";
        jsonResult["_source"] = res[0]["_source"];
        callback(jsonResult);
    });
}
function getAge(dob)
{
    var currentAge = "18-27";
    var day=Number(dob.substr(0,2));
    var month=Number(dob.substr(3,2))-1;
    var year=Number(dob.substr(6,4));
    var today=new Date();
    var age = today.getFullYear()-year;
    if(today.getMonth()<month || (today.getMonth()==month && today.getDate()<day)){age--;}
    else if(age>=28 && age<=38)
    {
        currentAge = "28-38";
    }
    else if(age>=39)
    {
        currentAge = "39+";
    }
    return currentAge;
};
function getHeight(height_in_inches)
{
    var height = "short";
    var h = height_in_inches.split("-")
    var foot = Number(h[0]);
    var inch = Number(h[1]);
    if(foot==5 && (inch>=3 && inch<=5))
    {
        height = "average";
    }
    else if(foot>=6 ||(foot==5 && inch>=6))
    {
        height = "tall";
    }
    return height;
};
function save_history(query) {
    connection.query(query,function (err,data) {
        if(err) console.error(err);
        else {
            console.log("successfully saved");}
    });
}
