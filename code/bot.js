const witAPIs = require('./witAPIS.js');
const global = require('./global.js');
const helper = require('./helper');
const sessions = require('./sessions');
const mapping = require('./mapping');
const elasticSearch = require('./elasticSearch');
const functions = require('./functions');
const filterList = require('./filter-list');
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
function witProcessMessage(user_profile, sessionId, message, user_type) {
    console.log("Before wit request Message :--> ",message);
    witAPIs.witMessageAPI(message, function (data)
    {
        console.log("RESPONSE CAME FROM WIT");
        let wit_entities = JSON.parse(data).entities;
        let entities = helper.extractEntities(wit_entities);
        console.log("=================== Entities ====================");
        console.log(entities);
        console.log("=================================================");
        save_history(sessionId,sessionId,message);
        let context = sessions.getContext(sessionId);
        try{
            if(message.toLowerCase()=="clear")
            {
                console.log("Session Cleared");
                context = sessions.clearContext(sessionId);
                sessions.storeContext(sessionId,context);
                save_history(sessionId,sessionId,"Your Previous Chat Cleared");
                sendMessage("chat",{"type":"text","message":"Your Previous Chat Cleared"},sessionId);
                return;
            }
        }catch(e){}
        if(Object.keys(entities).length==0)
        {
            let message = {"type":"text","message":"Sorry, I'm not able to understand your question."};
            save_history(sessionId,"bot",message.message);
            sendMessage("chat",message,sessionId);
        }
        if(entities.hasOwnProperty("product_line")) {
            //Filters Sending
            filterList.get_product_line_filters(mapping.product_line_to_db_keys[entities['product_line'][0]], function (result) 
            {
                let data = {};
                data.type = "filter_list";
                data.options = result;
                sendMessage("browse",data,sessionId);
            });
            if(entities['product_line'][0] != context.product_line)
            {
                if(context.product_line!=undefined)
                {
                    context = sessions.clearContext(sessionId);
                }
            }
            context.product_line = entities['product_line'][0];
        }
        if(entities.hasOwnProperty("broad_occasion")) {
            context.broad_occasion = entities['broad_occasion'][0];
        }
        if(entities.hasOwnProperty('occasion')) {
            context.occasion = entities['occasion'][0];
        }
        if(entities.hasOwnProperty('broad_category')) {
            context.broad_category = entities['broad_category'][0];
        }
        if(entities.hasOwnProperty("attribute_adj"))
        {
            context.attribute_adj = entities['attribute_adj'][0];
        }
        if(entities.hasOwnProperty("functional_adj"))
        {
            context.attribute_adj = entities['functional_adj'][0];
        }

        let remove_filter_status = false;
        if(entities.hasOwnProperty("type"))
        {
            if(entities["type"][0]=="remove")
            {
                remove_filter_status = true;
            }
            else
            {

            }
        }
        let attributes = [];
        let filters = [];
        let attribute_values = [];
        if(entities.hasOwnProperty("attribute")) attributes = attributes.concat(entities['attribute']);
        if(entities.hasOwnProperty("brand_name")) attribute_values = attribute_values.concat(entities['brand_name']);
        if(entities.hasOwnProperty("feature")) attribute_values = attribute_values.concat(entities['feature']);
        if(entities.hasOwnProperty("fabric")) attribute_values = attribute_values.concat(entities['fabric']);
        if(entities.hasOwnProperty("attribute_value")) attribute_values = attribute_values.concat(entities['attribute_value']);
        if(entities.hasOwnProperty("range") && entities.hasOwnProperty("number") || entities.hasOwnProperty("number") && entities.number.length==2)
        {
            console.log("Got Range");
            let range;
            try{
                range = entities.range[0];
            }catch(e){}
            let number = entities.number;
            let range_query = {"range":{"product_filter.discount_price":{}}};
            if(range=="above")
            {
                if(remove_filter_status)
                {
                    context.remove_tags.push({"key":"range","value":{"product_filter.discount_price":{"gte":Math.sqrt(Math.pow(number[0],2))}}});
                }
                else {
                    range_query.range["product_filter.discount_price"].gte = Math.sqrt(Math.pow(number[0],2));
                }
            }
            else if(range=="below")
            {
                if(remove_filter_status)
                {
                    context.remove_tags.push({"key":"range","value":{"product_filter.discount_price":{"lte":Math.sqrt(Math.pow(number[0],2))}}});
                }
                else {
                    range_query.range["product_filter.discount_price"].lte = Math.sqrt(Math.pow(number[0],2));
                }
            }
            else if(range=="between" || entities.number.length==2)
            {
                number[0] = Math.sqrt(Math.pow(number[0],2));
                number[1] = Math.sqrt(Math.pow(number[1],2));
                if(number[0]>number[1])
                {
                    let temp = number[0];
                    number[0] = number[1];
                    number[1] = temp;
                }
                if(remove_filter_status)
                {
                    context.remove_tags.push({"key":"range","value":{"product_filter.discount_price":{"gte":number[0],"lte":number[1]}}});
                }
                else {
                    range_query.range["product_filter.discount_price"].gte = number[0];
                    range_query.range["product_filter.discount_price"].lte = number[1];
                }
            }
            if(Object.keys(range_query.range["product_filter.discount_price"]).length>0)
                filters.push(range_query);
        }
        if(!context.hasOwnProperty("product_line")){
            if(context.hasOwnProperty("broad_category")) {
                console.log("No product line, broad category");
                let product_line_list = mapping.broad_category_to_product_lines[context["broad_category"]];
                let message = {
                    type : "single_select",
                    title:'Choose One Product Line'
                };
                message.options = product_line_list;
                save_history(sessionId,"bot",message.title);
                sendMessage("chat", message, sessionId);
                return;
            }
            else {
                console.log("No product line, no broad category");
                let message = {
                    type : "text",
                    message:'What product line are you looking for?'
                };
                save_history(sessionId,"bot",message.message);
                sendMessage("chat", message, sessionId);
                return;
            }
        }
        let product_line = mapping.product_line_to_db_keys[context.product_line];
        // Add attribute filters
        for(let i in attributes) {
            let attribute = attributes[i];
            let possible_values = mapping.possible_attribute_values[product_line][attribute];

            for(let j in attribute_values) {
                let attribute_value = attribute_values[j];
                if(possible_values.indexOf(attribute_value)!=-1) {
                    if(!remove_filter_status) {
                        let filter = {};
                        filter['product_filter.' + attribute] = attribute_value;
                        filters.push(filter);
                        for(let rem in context.remove_tags)
                        {
                            let filter_key = Object.keys(filter)[0];
                            if(filter_key==("product_filter."+context.remove_tags[rem].key) && context.remove_tags[rem].value==attribute_value)
                            {
                                context.remove_tags.splice(rem,1);
                            }
                        }
                    }
                    else {
                        let remove_filter = {};
                        remove_filter["key"] = attribute;
                        remove_filter["value"] = attribute_value;
                        context.remove_tags.push(remove_filter);
                        //removing from context filters
                        for(let fil in context.filters)
                        {
                            let filter_key = Object.keys(context.filters[fil])[0];
                            if(filter_key==("product_filter."+remove_filter.key) && context.filters[fil][filter_key]==remove_filter.value)
                            {
                                context.filters.splice(fil,1);
                            }
                        }
                        //removing from context benefits
                        for(let ben in context.benefits)
                        {
                            if(context.benefits.type==attribute && context.benefits.value==attribute_value)
                            {
                                context.benefits.splice(ben,1);
                            }
                        }
                    }
                    attribute_values.splice(j, 1);
                }
            }
        }
        // Adding attribute value filters
        for(let i in attribute_values) {
            let attribute_value = attribute_values[i];
            if(mapping.attribute_value_default_keys[product_line].hasOwnProperty(attribute_value)) {
                let attribute = mapping.attribute_value_default_keys[product_line][attribute_value];
                if(!remove_filter_status) {
                    let filter = {};
                    filter['product_filter.' + attribute] = attribute_value;
                    filters.push(filter);
                    for(let rem in context.remove_tags)
                    {
                        if(attribute==context.remove_tags[rem].key && context.remove_tags[rem].value==attribute_value)
                        {
                            context.remove_tags.splice(rem,1);
                        }
                    }
                }
                else {
                    let remove_filter = {};
                    remove_filter["key"] = attribute;
                    remove_filter["value"] = attribute_value;
                    context.remove_tags.push(remove_filter);
                    //removing from context filters
                    for(let fil in context.filters)
                    {
                        let filter_key = Object.keys(context.filters[fil])[0];
                        if(filter_key==("product_filter."+remove_filter.key) && context.filters[fil][filter_key]==remove_filter.value)
                        {
                            context.filters.splice(fil,1);
                        }
                    }
                    //removing from context benefits
                    for(let ben in context.benefits)
                    {
                        if(context.benefits.type==attribute && context.benefits.value==attribute_value)
                        {
                            context.benefits.splice(ben,1);
                        }
                    }
                }
            }
        }
        console.log("Filters :--", JSON.stringify(filters));
        console.log("Context Filters :--", JSON.stringify(context.filters));

        let rem_indexes = [];
        for(let i in filters)
        {
            for(let j in context.filters)
            {
                let fil_att = Object.keys(filters[i])[0];
                let con_att = Object.keys(context.filters[j])[0];
                console.log(fil_att,con_att);
                if(fil_att==con_att)
                {
                    if(rem_indexes.indexOf(j)==-1)
                        rem_indexes.push(j);
                }
            }
        }
        rem_indexes = rem_indexes.sort(function(a,b){return b-a;});
        for(let i in rem_indexes)
        {
            context.filters.splice(rem_indexes[i],1);
        }
        context.filters = context.filters.concat(filters);
        sessions.storeContext(sessionId,context);

        console.log("----------------- Context ---------------");
        console.log(context);
        console.log("-----------------------------------------");

        if(entities.hasOwnProperty("benefit"))
        {
            context.is_flow_complete = true;
            context.benefits.push({"type":"benefit","value":entities["benefit"][0],"important":true});
            sessions.storeContext(sessionId,context);
            fetch_Products({},sessionId);
            return;
        }
        if(!context.hasOwnProperty("broad_occasion") && context.hasOwnProperty("occasion"))
        {
            let broad_occasion_list = functions.pick_broad_occasion[product_line];
            let broad_occasion_keys = Object.keys(broad_occasion_list);
            let check_occasion = functions.get_number[product_line][context.occasion];
            for(let key1 in broad_occasion_keys)
            {
               let broad_occasion = broad_occasion_list[broad_occasion_keys[key1]];
               if(broad_occasion.indexOf(check_occasion)!=-1)
               {
                   context.answers.push(broad_occasion_keys[key1]);
                   context.answers.push(check_occasion);
                   console.log("Context Answers : ",context.answers);
                   break;
               }
            }
        }
        if(context.hasOwnProperty('attribute_adj'))
        {
            console.log("Attriubute adjectives");
           let adj_query = {
               index: 'styling_rules',
               type: 'adjectives_rules',
               body: {
                   "query": {
                       "bool": {
                           "must": []
                       }
                   }
               }
           };
            adj_query.body.query.bool.must.push({"match_phrase":{"product_line_name": mapping.product_line_to_db_keys[context.product_line]}});
            adj_query.body.query.bool.must.push({"match_phrase": {"adjective_value": context.attribute_adj}});

            elasticSearch.runQuery(adj_query,function(data,total,err){
                if(err==null)
                {
                    let adjective_rule = data[0]["_source"];
                    let attr_dependencies = adjective_rule.attribute_dependencies;
                    for(let k in attr_dependencies)
                    {
                        let attr = attr_dependencies[k].attribute_type;
                        attr = attr.toLowerCase();
                        let attr_value = attr_dependencies[k].attribute_value;
                        let filt = attr_value.map(function(x)
                        {
                            let json = {};
                            json["product_filter."+attr] = x;
                            return json;
                        });
                        context.filters = context.filters.concat(filt);
                    }
                    fetch_Products(user_profile,sessionId);
                }
                else
                {
                    let msg =
                    {
                       type:"text",
                       message: "We are not have "+context.attribute_adj+" "+context.product_line
                    };
                    save_history(sessionId,"bot",msg.message);
                    sendMessage("chat",msg,sessionId);
                }
            });
            return;
        }
        if(context.hasOwnProperty("broad_occasion"))
        {
            let product_line = mapping.product_line_to_db_keys[context.product_line];

            if(context.answers.indexOf(functions.get_number[product_line][context.broad_occasion])==-1)
                context.answers.push(functions.get_number[product_line][context.broad_occasion]);
            if(context.hasOwnProperty("occasion") && context.answers.indexOf(functions.get_number[product_line][context.occasion])==-1)
                context.answers.push(functions.get_number[product_line][context.occasion]);

            let cg_productLine = mapping.conversation_graph[product_line];
            let getStatus = check_conversation_graph(cg_productLine,context.answers);
            let status = getStatus[0];
            if(!status)
            {
                let index = context.answers.indexOf(functions.get_number[product_line][context.broad_occasion]);
                if(index!=-1)
                {
                    context.answers.splice(index,1);
                }
                let broad_occasion_list = functions.pick_broad_occasion[product_line];
                let broad_occasion_keys = Object.keys(broad_occasion_list);
                let check_occasion = functions.get_number[product_line][context.broad_occasion];
                for(let key1 in broad_occasion_keys)
                {
                    let broad_occasion = broad_occasion_list[broad_occasion_keys[key1]];
                    if(broad_occasion.indexOf(check_occasion)!=-1)
                    {
                        context.answers.push(broad_occasion_keys[key1]);
                        context.answers.push(check_occasion);
                        status = true;
                        break;
                    }
                }
            }
            if(!status)
            {
                console.log("Context answers : "+context.answers);
                let message = {
                    type : "text",
                    message:"We do not recommend the "+context.product_line+" for "+context.broad_occasion
                };
                save_history(sessionId,"bot",message.message);
                sendMessage("chat",message,sessionId);
                let user_think = {
                    "text": "Do you want to still continue...",
                    "type": "single_select",
                    "options": [
                        {
                            "key": "yes",
                            "value": "Yes"
                        },
                        {
                            "key": "no",
                            "value": "No"
                        }
                    ]
                };
                save_history(sessionId,"bot",user_think.message);
                sendMessage("chat",user_think,sessionId);
                return;
            }
        }
        answerTypeMessages(user_profile,sessionId,message,"message",user_type);
    });
}

function answerTypeMessages(user_profile,sessionId,list_or_object,type,user_type)
{
    let flow_state = true;
    let context = sessions.getContext(sessionId);
    let user_answer = list_or_object;
    user_profile = Object.assign(context.user_profile,user_profile);
    console.log("User profile is ",user_profile);
    let user_profile_keys = Object.keys(user_profile);
    if(user_answer=="yes")
    {
        console.log("got answer yes");
        save_history(sessionId,sessionId,"yes");
        context.answers = [];
    }
    else if(user_answer=="no")
    {
        console.log("got answer no");
        save_history(sessionId,sessionId,"no");
        sessions.clearContext(sessionId);
        let message = {
            "type":"text",
            "message":"What product line do you want?"
        };
        save_history(sessionId,"bot",message.message);
        sendMessage("chat",message,sessionId);
        return;
    }
    if(user_profile_keys.length!=4)
    {
        let profile = user_answer.split("--");
        let product_line = mapping.product_line_to_db_keys[context.product_line];
        let pro_benefits = functions.profile_benefits[product_line];
        if(profile.length==2)
        {
            if(pro_benefits.hasOwnProperty(profile[1]) && !user_profile.hasOwnProperty(profile[0]))
            {
                save_history(sessionId,sessionId,profile[1]);
                user_profile[profile[0]] = profile[1];
                let profile_reason = pro_benefits[profile[1]].reason;
                if(profile_reason!="")
                {
                    let sentence = [
                        "We have picked styles ",
                        "We have chosen styles ",
                        "We have selected styles "];

                    let reason_message={"type":"text","message":sentence[helper.random(0,sentence.length-1)]+profile_reason};
                    save_history(sessionId,"bot",reason_message.message);
                    sendMessage("chat",reason_message,sessionId);
                }
            }
        }
        flow_state = false;
    }
    user_profile_keys = Object.keys(user_profile);
    
    if(flow_state)
    {
        try
        {
            let user_answer = list_or_object;
            console.log("======================================");
            console.log(user_answer);

            if(type!="message")
            {
                if(user_answer!="yes" && user_answer!="no" && context.answers.indexOf(user_answer)==-1 && flow_state)
                {
                    context.answers.push(user_answer);
                    let product_line = mapping.product_line_to_db_keys[context.product_line];
                    let user_message = functions.get_number[product_line]
                    let msg_keys = Object.keys(user_message);
                    for(let um in msg_keys)
                    {
                        if(user_message[msg_keys[um]]==user_answer)
                        {
                            save_history(sessionId,sessionId,msg_keys[um]);
                            break;
                        }
                    }
                }
            }

            console.log("=================== context answers ===================");
            console.log(context.answers);
            console.log("=======================================================");
        }catch (e){}
    }
    if(type=="message" && user_type!="website")
        fetch_Products(user_profile,sessionId);
    let product_line = mapping.product_line_to_db_keys[context.product_line];
    try{
        // Getting conversation Graph for particular product line
        
        let cg_productLine = mapping.conversation_graph[product_line];
        let getStatus = check_conversation_graph(cg_productLine,context.answers);
        let status = getStatus[0];
        let index = getStatus[1];
        // Selecting the require Object in Conversation Graph
        if(status)
        {
            let require_obj = cg_productLine[index];
            let nextQuestion = require_obj.next;
            let reason = "";
             let sentence = [
                        "We have picked styles ",
                        "We have chosen styles ",
                        "We have selected styles "];
            if(require_obj.reason!="")
                reason += sentence[helper.random(0,sentence.length-1)];
            reason += require_obj.reason;

            if(require_obj.benefits[0]!=undefined) {
                let benefit_obj = {
                    "type": "benefit",
                    "value": require_obj.benefits[0]
                };
                if (!containsObject(benefit_obj, context.benefits)) {
                    if(context.benefits.length==0)
                        benefit_obj["important"] = true;
                    else
                        benefit_obj["important"] = false;
                    context.benefits.push(benefit_obj);
                    if (require_obj.next != "result" && user_type!="website")
                        fetch_Products(user_profile, sessionId);
                }
            }
            else if(require_obj.benefits.length==0 && require_obj.answers.length!=0)
            {
                if(nextQuestion!="result")
                {
                    let questions = mapping.questions[product_line][nextQuestion];
                    context.extra_benefits = [];
                    let benefit_length = context.benefits.length;
                    for(let i in questions.options)
                    {
                        let ans = [];
                        ans = ans.concat(context.answers);
                        ans.push(questions.options[i].key);
                        getStatus = check_conversation_graph(cg_productLine,ans);
                        status = getStatus[0];
                        index = getStatus[1];
                        if(status)
                        {
                            let obj = cg_productLine[index];
                            if(obj.benefits[0]!=undefined) {
                                let ben_obj = {
                                    "type": "benefit",
                                    "value": obj.benefits[0]
                                };
                                if (!containsObject(ben_obj, context.extra_benefits) && !containsObject(ben_obj, context.benefits)) {
                                    if(benefit_length==0)
                                        ben_obj["important"] = true;
                                    else
                                        ben_obj["important"] = false;
                                    context.extra_benefits.push(ben_obj);
                                }
                            }
                        }
                    }
                    console.log("==================== Extra Benefits ========================");
                    console.log(context.extra_benefits);
                    if(user_type!="website")
                        fetch_Products(user_profile,sessionId);
                }
            }

            console.log("================== Require Object =================");
            console.log(require_obj);
            console.log("===================================================");

            if(user_profile_keys.length!=4)
            {
                flow_state = false;
                let p_ben = functions.profile_benefits[product_line];
                console.log(Object.keys(p_ben));
                let profile_question_state = true;
                if(!user_profile.hasOwnProperty("body_shape"))
                {
                    let item_count = 0;
                    let body_shape = {
                        "text": "What type of Body Shape do you have?",
                        "type": "single_select",
                        "options": [
                            {
                                "key": "body_shape--apple",
                                "value": "Apple Shape"
                            },
                            {
                                "key": "body_shape--rectangle",
                                "value": "Rectangle Shape"
                            },
                            {
                                "key": "body_shape--pear",
                                "value": "Pear Shape"
                            },
                            {
                                "key": "body_shape--hour glass",
                                "value": "Hour glass Shape"
                            }
                        ]
                    };
                    if(p_ben["apple"].benefit!="")
                    {
                        item_count++;
                    }
                    if(p_ben["rectangle"].benefit!="")
                    {
                        item_count++;
                    }
                    if(p_ben["pear"].benefit!="")
                    {
                        item_count++;
                    }
                    if(p_ben["hour glass"].benefit!="")
                    {
                        item_count++;
                    }
                    console.log("user_profile : ",user_profile);
                    if(item_count!=0)
                    {
                        save_history(sessionId,"bot",body_shape.text);
                        console.log("sending message");
                        sendMessage("chat",body_shape,sessionId);
                        profile_question_state = false;
                    }
                    else
                    {
                        user_profile["body_shape"] = "";
                    }
                }
                if(!user_profile.hasOwnProperty("skin_color") && profile_question_state)
                {
                    let item_count = 0;
                    let skin_color = {
                        "text": "What type of Skin do you Have?",
                        "type": "single_select",
                        "options": [
                            {
                                "key": "skin_color--wheatish",
                                "value": "Wheatish Color"
                            },
                            {
                                "key": "skin_color--fair",
                                "value": "Fair Color"
                            },
                            {
                                "key": "skin_color--dark",
                                "value": "Dark Color"
                            }
                        ]
                    };
                    if(p_ben["wheatish"].benefit!="")
                    {
                        item_count++;
                    }
                    if(p_ben["fair"].benefit!="")
                    {
                        item_count++;
                    }
                    if(p_ben["dark"].benefit!="")
                    {
                        item_count++;
                    }
                    if(item_count!=0)
                    {
                        save_history(sessionId,"bot",skin_color.text);
                        sendMessage("chat",skin_color,sessionId);
                        profile_question_state = false;
                    }
                    else
                    {
                        user_profile["skin_color"] = "";
                    }
                }
                if(!user_profile.hasOwnProperty("height") && profile_question_state)
                {
                    let item_count = 0;
                    let height = {
                        "text": "Select your height",
                        "type": "single_select",
                        "options": [
                            {
                                "key": "height--short",
                                "value": "Short"
                            },
                            {
                                "key": "height--average",
                                "value": "Average"
                            },
                            {
                                "key": "height--tall",
                                "value": "Tall"
                            }
                        ]
                    };
                    if(p_ben["short"].benefit!="")
                    {
                        item_count++;
                    }
                    if(p_ben["average"].benefit!="")
                    {
                        item_count++;
                    }
                    if(p_ben["tall"].benefit!="")
                    {
                        item_count++;
                    }
                    if(item_count!=0)
                    {
                        save_history(sessionId,"bot",height.text);
                        sendMessage("chat",height,sessionId);
                        profile_question_state = false;
                    }
                    else
                    {
                        user_profile["height"] = "";
                    }
                }
                if(!user_profile.hasOwnProperty("age") && profile_question_state)
                {
                    let item_count = 0;
                    let age = {
                        "text": "Select your age",
                        "type": "single_select",
                        "options": [
                            {
                                "key": "age--18-27",
                                "value": "18 to 27"
                            },
                            {
                                "key": "age--28-38",
                                "value": "28 to 38"
                            },
                            {
                                "key": "age--39+",
                                "value": "39+"
                            }
                        ]
                    };
                    if(p_ben["18-27"].benefit!="")
                    {
                        item_count++;
                    }
                    if(p_ben["28-38"].benefit!="")
                    {
                        item_count++;
                    }
                    if(p_ben["39+"].benefit!="")
                    {
                        item_count++;
                    }
                    if(item_count!=0)
                    {
                        save_history(sessionId,"bot",age.text);
                        sendMessage("chat",age,sessionId);
                        profile_question_state = false;
                    }
                    else
                    {
                        user_profile["age"] = "";
                    }
                }
                context.user_profile = user_profile;
                sessions.storeContext(sessionId,context);
                if(user_type!="website")
                    fetch_Products(user_profile,sessionId);
                return;
            }
            if(nextQuestion!="result")
            {
                console.log("Next Question Type is : "+nextQuestion);
                let require_data = mapping.questions[product_line][nextQuestion];
                if(reason!=undefined && reason!="") {
                    save_history(sessionId,"bot",reason);
                    sendMessage("chat", {type: "text", message: reason}, sessionId);
                }
                save_history(sessionId,"bot",require_data.text);
                sendMessage("chat",require_data,sessionId);
            }
            else
            {
                context.is_flow_complete = true;
                context.event_state = true;
                sessions.storeContext(sessionId,context);
                if(user_type!="website")
                    fetch_Products(user_profile,sessionId);
            }
        }
        else
        {
            let index = context.answers.indexOf(user_answer);
            if(index>-1)
            {
                context.answers.splice(index,1);
            }
        }
    }catch(e){}
}
function update_filterlist(user_profile,sessionId,filter_list)
{
    console.log("Got Filters");
    let context = sessions.getContext(sessionId);
    let filters = [];
    for(let i in filter_list)
    {
       let object = filter_list[i];
        console.log(object);
        //Checking if it is range or not
        if(object["key"]!="discount_price" && object["key"]!="price" && object["key"]!="discount_percent")
        {
            console.log("Without discount_price and discount_percent")
            let attribute = "product_filter."+object["key"];
            let values = object["values"];
            for(let j in values)
            {
                let json = {};
                json[attribute] = values[j].toLowerCase();
                filters.push(json);
            }
        }
        else
        {
            if(object["key"]=="price" || object["key"]=="discount_price")
            {
                console.log("With discount_price");
                let values = object.values[0].split(" ");
                let range_query = {"range":{"product_filter.discount_price":{}}};

                range_query.range["product_filter.discount_price"]["gte"] = parseInt(values[0]);
                if(values[2]!="above")
                    range_query.range["product_filter.discount_price"]["lte"] = parseInt(values[2]);
                console.log(range_query);
               filters.push(range_query);
            }
            else
            {
                console.log("With discount_percent");
                let range_query = {"range":{"product_filter.discount_percent":{}}};
                if((object.values[0]).toLowerCase()!="less than 10%")
                {
                    let values = object.values[0].split("%");
                    range_query.range["product_filter.discount_percent"]["gte"] = parseInt(values[0]);
                    range_query.range["product_filter.discount_percent"]["lte"] = 100;
                }
                else
                {
                    range_query.range["product_filter.discount_percent"]["gte"] = 0;
                    range_query.range["product_filter.discount_percent"]["lte"] = 10;
                }
                console.log(range_query);
                filters.push(range_query);
            }
        }
    }
    context.filters = filters;
    sessions.storeContext(sessionId,context);
    fetch_Products(user_profile,sessionId);
}
function check_conversation_graph(cg_productLine,answers)
{
    let index = 0;
    let status = false;
    for(let i in cg_productLine)
    {
        let obj = cg_productLine[i];
        if(arraysEqual(obj.answers,answers))
        {
            status = true;
            index = i;
            break;
        }
    }
    return [status,index];
}

function fetch_Products(user_profile,sessionId)
{
    let context = sessions.getContext(sessionId);
    console.log("Fetching Products");
    let product_line = mapping.product_line_to_db_keys[context.product_line];
    //Getting Profile Benefits and Reasons
    let benefits = profile_benefits(context.benefits,user_profile,product_line);
    if(context.benefits.length==0)
        benefits = benefits.concat(context.extra_benefits);
    if(context.benefits.length==0 && context.extra_benefits.length==0)
    {
        console.log("context benefits empty");
        for(let i in context.web_benefits)
        {
            let ben = context.web_benefits[i];
            benefits.unshift(ben);
        }
    }

    console.log("----------------------Context Benefits----------------------");
    console.log(JSON.stringify(benefits,null,2));
    console.log("--------------------------------------------");

    // Setting the Applied Filters list
    let applied_filters = get_applied_filters(context.filters);
    console.log("============== Applied Filters ================");
    console.log(JSON.stringify(applied_filters));
    console.log("=============== Remove Tags ===================");
    console.log(JSON.stringify(context.remove_tags,null,2));

    functions.get_products(context.filters,context.remove_tags,product_line, benefits, context.from, context.is_flow_complete, function(result_list)
    {
        let result_length = result_list[0].total;
        let flow_state = result_list[0].is_flow_complete;
        console.log(result_list[0]);
        let benefit_names = [];
        for(let ben in benefits)
        {
            let ben_name;
            if(functions.benefit_name[benefits[ben].value]!=undefined)
            {
                ben_name = functions.benefit_name[benefits[ben].value];
            }
            else
            {
                ben_name = benefits[ben].value
            }
            benefit_names.push(ben_name);
        }

        result_list = result_list.slice(1,result_list.length);
        //result_list = sort_by_benefit_length(result_list);
        result_list = result_list.slice(0, (result_list.length<60?result_length:60));

        //Products Sending
        let product_data = {};
        product_data.type = "product_list";
        product_data.parent = "suggestion";
        product_data.current_page = context.from;
        product_data.show_message = false;
        product_data.total_length = result_length;
        if(product_data.current_page==0 && flow_state)
            product_data.show_message = true;
        product_data.send_feedback = context.event_state;
        product_data.list = result_list;
        product_data.message = {"type":"text","message":"According to your needs \nTotal "+result_length+" results found"};
        sendMessage("browse", product_data, sessionId);
        if(product_data.show_message)
            save_history(sessionId,"bot",product_data.message.message);

        //Tags Sending
        functions.get_tags(product_line,benefits,context.remove_tags,function(tags)
        {
            let tag_data = {};
            tag_data.type = "tag_list";
            tag_data.list = {};
            tag_data.list.list_tags = tags;
            tag_data.list.recommended_tags = [];
            sendMessage("browse", tag_data, sessionId);
        });

    });
}

function get_applied_filters(context_filters)
{
    let applied_filters = [];
    let json_type = {};
    for(let flt in context_filters)
    {
        let obj = context_filters[flt];
        let attrib = Object.keys(obj)[0];
        if(json_type[attrib]==undefined)
            json_type[attrib] = [];
        json_type[attrib].push(obj[attrib]);
    }
    let json_type_keys = Object.keys(json_type);
    for(let at in json_type_keys)
    {
        if(json_type_keys[at]!="range")
        {
            let key = json_type_keys[at].split('.')[1];
            let values = json_type[json_type_keys[at]];
            applied_filters.push({"key":key,"values":values});
        }
        else
        {
            let range_query = json_type[json_type_keys[at]];

            for(let r_val in range_query)
            {
                let range_key = Object.keys(range_query[r_val])[0];
                let value,key;
                let gte = range_query[r_val][range_key].gte;
                let lte = range_query[r_val][range_key].lte;
                if(range_key=="product_filter.discount_price")
                {
                    key = "discount_price";
                    if(lte==undefined)
                        value = [gte+" or above"];
                    else if(gte==undefined)
                        value = [lte+" or below"];
                    else
                        value = [gte+" to "+lte];
                }
                else if(range_key=="product_filter.discount_percent")
                {
                    key = "discount_percent";
                    if(gte==0 & lte==10)
                        value = ["less than 10%"];
                    else
                        value = [gte+"% or more"];
                }
                applied_filters.push({"key":key,"values":value});
            }
        }
    }
    return applied_filters;
}

function sort_by_benefit_length(array) {

    return array.sort(function(a, b) {
        return b["benefits"].length - a["benefits"].length;
    });
}
function sendMessage(channel, data, sessionId) {
    console.log("Message to user : ", data.type);
    let socket = global.getUserSocket(sessionId);
    if(socket) {
        socket.emit(channel, data);
    }
}
function arraysEqual(structureAnswers, contextAnswers) {
    if (structureAnswers == null || contextAnswers == null) return false;
    if (structureAnswers.length != contextAnswers.length) return false;

    let count = 0;
    let result = true;
    for (let i = 0; i < structureAnswers.length; i++) {
        if(typeof structureAnswers[i] !="object")
        {
            if(contextAnswers.indexOf(structureAnswers[i])<0)
            {
                result = false;
                break;
            }
        }
        else
        {
            let sub_result = false;
            for(let j=0;j<structureAnswers[i].length;j++)
            {
                if(contextAnswers.indexOf(structureAnswers[i][j])>0)
                {
                    sub_result = true;
                    break;
                }
            }
            if(!sub_result)
            {
                result = false;
                break;
            }
        }
    }
    return result;
}
function profile_benefits(context_benefits,profile,product_line)
{
    console.log("fetching Profile Benefits",product_line);
    let benefits = [];
    benefits = benefits.concat(context_benefits);
    if(functions.profile_benefits.hasOwnProperty(product_line))
    {
        let defaults = functions.profile_benefits[product_line];

        let body_shape = defaults[profile["body_shape"]];
        let age = defaults[profile["age"]];
        let height = defaults[profile["height"]];
        let skin_color = defaults[profile["skin_color"]];

        
        if(body_shape!=undefined)
            if(body_shape.benefit!="")
            {
                let obj = {"type":"benefit","value":body_shape.benefit,"important":false};
                if(!containsObject(obj,benefits))
                {
                    benefits.push(obj);
                }
            }
        if(height!=undefined)
            if(height.benefit!="")
            {
                let obj = {"type":"benefit","value":height.benefit,"important" : false}
                if(!containsObject(obj,benefits))
                {
                    benefits.push(obj);
                }
            }
        if(age!=undefined)
            if(age.benefit!="")
            {
                let obj = {"type":"benefit","value":age.benefit,"important":false};
                if(!containsObject(obj,benefits))
                {
                    benefits.push(obj);
                }
            }

        if(skin_color!=undefined)
            if(skin_color.benefit!="")
            {
                let obj = {"type":"benefit","value":skin_color.benefit,"important":false}
                if(!containsObject(obj,benefits))
                {
                    benefits.push(obj);
                }
            }
    }
    else
    {
        console.log("not having "+product_line);
    }
    return benefits;
}
function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (obj.type == list[i].type && obj.value == list[i].value) {
            return true;
        }
    }
    return false;
}


function save_history(sessionId, sender, content) {
    let current_time = new Date();
    let query = 'INSERT INTO chatapp_msg (session_id,sender,content,username,timestamp) VALUES("'+sessionId+'","'+sender+'","'+content+'","'+sessionId+'","'+current_time.getTime()+'");';
    console.log(query);
    connection.query(query,function (err,data) {
        if(err) console.error(err);
        else {}
    });
}

function get_previous_question_state(user_profile, sessionId, type, question, prev_question_type,prev_user_msg)
{
    let context = sessions.getContext(sessionId);
    if(type=="answer") {
        context.extra_benefits = [];
        if (context.answers.length > 0) {
            let product_line = mapping.product_line_to_db_keys[context.product_line];
            let cg_productLine = mapping.conversation_graph[product_line];
            let getStatus = check_conversation_graph(cg_productLine, context.answers);
            let status = getStatus[0];
            if (status) {
                let required_obj = cg_productLine[getStatus[1]];
                let benefit = required_obj.benefits[0];
                if (benefit!=undefined) {
                    if (benefit.length > 0) {
                        for (let i in context.benefits) {
                            if (context.benefits[i].type == "benefit" && context.benefits[i].value == benefit) {
                                context.benefits.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
            }
            context.answers.splice(context.answers.length - 1, 1);
        }
        else
        {
            let user_msg = question.split("--");
            if(user_msg.length==2)
            {
                delete context.user_profile[user_msg[0]];
            }
        }
        sessions.storeContext(sessionId, context);
        if(prev_question_type=="message")
        {
            answerTypeMessages(user_profile,sessionId,prev_user_msg, prev_question_type);
        }
        else if(prev_question_type=="answer")
        {
            context.answers.splice(context.answers.length - 1, 1);
            sessions.storeContext(sessionId, context);
            answerTypeMessages(user_profile,sessionId,prev_user_msg, prev_question_type);
        }
    }
    else {
        witAPIs.witMessageAPI(question, function (data)
        {
            let wit_entities = JSON.parse(data).entities;
            let entities = helper.extractEntities(wit_entities);
            console.log("============== Entities ================");
            console.log(entities);
            if(entities.hasOwnProperty("product_line"))
            {
                sessions.clearContext(sessionId);
                let message = {"type":"text","message":"What productline do you want?"};
                sendMessage("chat",message,sessionId);
                return;
            }
            if(entities.hasOwnProperty("broad_occasion"))
            {
                delete context.broad_occasion;
            }
            if(entities.hasOwnProperty("occasion"))
            {
                delete context.occasion;
            }
            if(entities.hasOwnProperty('broad_category')) {
                delete context.broad_category;
            }
            if(entities.hasOwnProperty("attribute_adj") || entities.hasOwnProperty("functional_adj"))
            {
                delete context.attribute_adj;
            }
            let remove_filter_status = false;
            if(entities.hasOwnProperty("type"))
            {
                if(entities["type"][0]=="remove")
                {
                    remove_filter_status = true;
                }
                else
                {//
                }
            }
            let attributes = [];
            let attribute_values = [];
            if(entities.hasOwnProperty("attribute")) attributes = attributes.concat(entities['attribute']);
            if(entities.hasOwnProperty("brand_name")) attribute_values = attribute_values.concat(entities['brand_name']);
            if(entities.hasOwnProperty("feature")) attribute_values = attribute_values.concat(entities['feature']);
            if(entities.hasOwnProperty("fabric")) attribute_values = attribute_values.concat(entities['fabric']);
            if(entities.hasOwnProperty("attribute_value")) attribute_values = attribute_values.concat(entities['attribute_value']);
            if(entities.hasOwnProperty("range") && entities.hasOwnProperty("number") || entities.hasOwnProperty("number") && entities.number.length==2)
            {
                console.log("Got Range");
                let range;
                try{
                    range = entities.range[0];
                }catch(e){}
                let number = entities.number;
                let range_query = {"range":{"product_filter.discount_price":{}}};
                if(range=="above")
                {
                    if(remove_filter_status)
                    {
                        for(let i in context.remove_tags)
                        {
                            if(JSON.stringify(context.remove_tags[i])==JSON.stringify({"key":"range","value":{"product_filter.discount_price":{"gte":number[0]}}}))
                            {
                                context.remove_tags.splice(i,1);
                            }
                        }
                    }
                    else {
                        range_query.range["product_filter.discount_price"].gte = number[0];
                    }
                }
                else if(range=="below")
                {
                    if(remove_filter_status)
                    {
                        for(let i in context.remove_tags)
                        {
                            if(JSON.stringify(context.remove_tags[i])==JSON.stringify({"key":"range","value":{"product_filter.discount_price":{"lte":number[0]}}}))
                            {
                                context.remove_tags.splice(i,1);
                            }
                        }
                    }
                    else {
                        range_query.range["product_filter.discount_price"].lte = number[0];
                    }
                }
                else if(range=="between" || entities.number.length==2)
                {
                    if(number[0]>number[1])
                    {
                        let temp = number[0];
                        number[0] = number[1];
                        number[1] = temp;
                    }
                    if(remove_filter_status)
                    {
                        for(let i in context.remove_tags)
                        {
                            if(JSON.stringify(context.remove_tags[i])==JSON.stringify({"key":"range","value":{"product_filter.discount_price":{"gte":number[0],"lte":number[1]}}}))
                            {
                                context.remove_tags.splice(i,1);
                            }
                        }
                    }
                    else {
                        range_query.range["product_filter.discount_price"].gte = number[0];
                        range_query.range["product_filter.discount_price"].lte = number[1];
                    }
                }
                for(let i in context.filters)
                {
                    if(JSON.stringify(context.filters[i])==JSON.stringify(range_query))
                    {
                        context.filters.splice(i,1);
                    }
                }
            }
            let product_line = mapping.product_line_to_db_keys[context.product_line];
            for(let i in attributes) {
                let attribute = attributes[i];
                let possible_values = mapping.possible_attribute_values[product_line][attribute];

                for(let j in attribute_values) {
                    let attribute_value = attribute_values[j];
                    if(possible_values.indexOf(attribute_value)!=-1) {
                        if(!remove_filter_status) {
                            let filter = {};
                            filter['product_filter.' + attribute] = attribute_value;
                            for(let fil in context.filters)
                            {
                                if(JSON.stringify(context.filters[fil]) == JSON.stringify(filter))
                                {
                                    context.filters.splice(fil,1);
                                    break;
                                }
                            }
                        }
                        else {
                            let remove_filter = {};
                            remove_filter["key"] = attribute;
                            remove_filter["value"] = attribute_value;
                            for(let fil in context.remove_tags)
                            {
                                if(JSON.stringify(context.remove_tags[fil]) == JSON.stringify(remove_filter))
                                {
                                    context.remove_tags.splice(fil,1);
                                }
                            }
                        }
                        attribute_values.splice(j, 1);
                    }
                }
            }
            // Adding attribute value filters
            for(let i in attribute_values) {
                let attribute_value = attribute_values[i];
                if(mapping.attribute_value_default_keys[product_line].hasOwnProperty(attribute_value)) {
                    let attribute = mapping.attribute_value_default_keys[product_line][attribute_value];
                    if(!remove_filter_status) {
                        let filter = {};
                        filter['product_filter.' + attribute] = attribute_value;
                        for(let fil in context.filters)
                        {
                            if(JSON.stringify(context.filters[fil]) == JSON.stringify(filter))
                            {
                                context.filters.splice(fil,1);
                                break;
                            }
                        }
                    }
                    else {
                        let remove_filter = {};
                        remove_filter["key"] = attribute;
                        remove_filter["value"] = attribute_value;
                        for(let fil in context.remove_tags)
                        {
                            if(JSON.stringify(context.remove_tags[fil]) == JSON.stringify(remove_filter))
                            {
                                context.remove_tags.splice(fil,1);
                            }
                        }
                    }
                }
            }
            //storing context
            sessions.storeContext(sessionId,context);
            if(prev_question_type=="message")
            {
                answerTypeMessages(user_profile,sessionId,prev_user_msg, prev_question_type);
            }
            else if(prev_question_type=="answer")
            {
                context.answers.splice(context.answers.length - 1, 1);
                sessions.storeContext(sessionId, context);
                answerTypeMessages(user_profile,sessionId,prev_user_msg, prev_question_type);
            }
        });
    }
}
module.exports = {
    witProcessMessage: witProcessMessage,
    answerTypeMessages : answerTypeMessages,
    update_filterlist : update_filterlist,
    profile_benefits : profile_benefits,
    fetch_Products : fetch_Products,
    get_previous_question_state : get_previous_question_state
};