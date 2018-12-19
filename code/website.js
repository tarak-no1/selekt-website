const witAPIs = require('./witAPIS.js');
const global = require('./global.js');
const helper = require('./helper');
const sessions = require('./sessions');
const mapping = require('./mapping');
const elasticSearch = require('./elasticSearch');
const functions = require('./functions');
const filterList = require('./filter-list');
let getEntities = function(message,sessionId,callback)
{
    let entities = {};
    let product_line = check_for_productline(message.toLowerCase(),entities);
    entities = product_line[0];
    message = product_line[1];

    if(!entities.hasOwnProperty("product_line"))
    {
        let error = {"type":"text","message":"no results found"};
        sendMessage("chat",error,sessionId);
        callback();
        return;
    }
    let db_product_line = mapping.product_line_to_db_keys[entities["product_line"]];

    let occasion = check_for_occasion(message,entities);
    entities = occasion[0];
    message = occasion[1];

    let broad_occasion = check_for_broad_occasion(message,entities);
    entities = broad_occasion[0];
    message = broad_occasion[1];

     let attribute_values = check_for_attribute(message,entities,db_product_line);
     entities = attribute_values[0];
     message = attribute_values[1];

     let range = check_for_range(message,entities);
     entities = range[0];
     message = range[1];
     /*let profile_benefits = check_for_profile_benefits(message,entities);
     entities = profile_benefits[0];
     message = profile_benefits[1];*/

    callback(entities);
}
function webProcessMessage(sessionId, message, from, callback) {
    getEntities(message,sessionId, function (entities)
    {
        let query =
        {
            index:"products_data",
            body:{"query":{"bool":{"must":[]}},"from":from,"size":60}
        };
        let product_line,cg_productLine;
        let benefits = [];
        let benefit_names =[];
        let context = sessions.getContext(sessionId);
        console.log("=================== Web Entities ====================");
        console.log(entities);
        console.log("=================================================");
        if(entities.hasOwnProperty("product_line"))
        {
            let entity_productline = entities["product_line"];
            context.product_line = entities['product_line'];
            product_line = mapping.product_line_to_db_keys[entity_productline];
            query["type"] = product_line;
            cg_productLine = mapping.conversation_graph[product_line];
        }
        let profile_benefit = functions.profile_benefits[product_line];
        let keys_of_benefits = [];
        if(profile_benefit!=undefined)
            keys_of_benefits = Object.keys(profile_benefit);

        for(let i in keys_of_benefits)
        {
            if(message.indexOf(keys_of_benefits[i])!=-1)
            {
                let user_benefits = {"short":"height","average":"height","tall":"height","18-27":"age","28-38":"age","39+":"age",
                    "wheatish":"skin_color","fair":"skin_color","dark":"skin_color","apple":"body_shape","rectangle":"body_shape","hour glass":"body_shape","pear":"body_shape"};
                if(user_benefits.hasOwnProperty(keys_of_benefits[i])) {
                    context.user_profile[user_benefits[keys_of_benefits[i]]] = keys_of_benefits[i];
                }
                sessions.storeContext(sessionId,context);
                let name_of_benefit = profile_benefit[keys_of_benefits[i]].benefit;
                benefits.push({"name":name_of_benefit,"reason":profile_benefit[keys_of_benefits[i]].reason,"answer_key":keys_of_benefits[i]})
                benefit_names.push(name_of_benefit);
            }
        }
        let answers = [];
        if(entities.hasOwnProperty("broad_occasion"))
        {
            context.broad_occasion = entities['broad_occasion'];
            let key = functions.get_number[product_line][entities["broad_occasion"]];
            answers.push(key);
        }
        if(entities.hasOwnProperty("occasion"))
        {
            context.occasion = entities['occasion'];
            let key = functions.get_number[product_line][entities["occasion"]];
            if(!entities.hasOwnProperty("broad_occasion"))
            {
                let broad_occasion_names = functions.pick_broad_occasion[product_line];
                let broad_keys = Object.keys(broad_occasion_names);
                for(let i in broad_keys)
                {
                    let broad_occasion = broad_occasion_names[broad_keys[i]];
                    if(broad_occasion.indexOf(key)!=-1)
                    {
                        answers.push(broad_keys[i]);
                        break;
                    }
                }
            }
            answers.push(key);
        }
        let get_required_graph = function(cg_productLine,answers)
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
            return([index,status]);
        }
        let graph = get_required_graph(cg_productLine,answers);
        let index1 = graph[0];
        let status2 = graph[1];
        if(status2)
        {
            if(cg_productLine[index1]["benefits"].length>0)
            {
                let answer_key_names = get_names_of_keys(cg_productLine[index1].answers,product_line);
                if(!containsObject({"type":"benefit","value":cg_productLine[index1].benefits[0]},context.web_benefits))
                    context["web_benefits"].push({"type":"benefit","value":cg_productLine[index1].benefits[0]});
                benefits.push({"name":cg_productLine[index1].benefits[0],"reason":cg_productLine[index1].reason,"answer_key":answer_key_names});
                benefit_names.push(cg_productLine[index1].benefits[0]);
                sessions.storeContext(sessionId,context);
            }
            else if(answers.length>0)
            {
                let next = cg_productLine[index1].next;
                let questions = mapping.questions[product_line][next].options;
                let require_answers = [];
                for(let i in questions)
                {
                    require_answers = [];
                    require_answers = require_answers.concat(answers);
                    let key = questions[i].key;
                    let value = questions[i].value;
                    require_answers.push(key);
                    let get_graph = get_required_graph(cg_productLine,require_answers);
                    if(get_graph[1])
                    {
                        if(cg_productLine[get_graph[0]]["benefits"].length>0)
                        {
                            let answer_key_names = get_names_of_keys(cg_productLine[get_graph[0]].answers,product_line);
                            if(!containsObject({"type":"benefit","value":cg_productLine[get_graph[0]].benefits[0]},context.web_benefits))
                                context["web_benefits"].push({"type":"benefit","value":cg_productLine[get_graph[0]].benefits[0]});
                            benefits.push({"name":cg_productLine[get_graph[0]].benefits[0],"reason":cg_productLine[get_graph[0]].reason,"answer_key":answer_key_names});
                            benefit_names.push(cg_productLine[get_graph[0]].benefits[0]);
                            sessions.storeContext(sessionId,context);
                        }
                    }
                }
            }
        }
        if(benefit_names.length>0)
            query.body.query.bool.must.push({"terms":{"benefits":benefit_names}});

        let filters = {};
        let attribute_values = [];
        if(entities.hasOwnProperty("attribute_value")) attribute_values = attribute_values.concat(entities['attribute_value']);

        // Adding attribute value filters
        for(let i in attribute_values) {
            let attribute_value = attribute_values[i];
            if(mapping.attribute_value_default_keys[product_line].hasOwnProperty(attribute_value)) {
                let attribute = mapping.attribute_value_default_keys[product_line][attribute_value];
                if(filters['product_filter.' + attribute]==undefined)
                    filters['product_filter.' + attribute] = [];
                filters['product_filter.' + attribute].push(attribute_value);
            }
        }
        let filter_keys = Object.keys(filters);
        for(let i in filter_keys)
        {
            let output = {};
            output[filter_keys[i]] = filters[filter_keys[i]];
            query.body.query.bool.must.push({"terms":output});
        }
        if(entities.hasOwnProperty("range") && entities.hasOwnProperty("number") || entities.hasOwnProperty("number") && entities.number.length==2)
            {
                console.log("Got Range");
                let range;
                try{
                    range = entities.range;
                }catch(e){}
                let number = entities.number;
                let range_query = {"range":{"product_filter.discount_price":{}}};
                if(range=="above")
                {
                    range_query.range["product_filter.discount_price"].gte = Math.sqrt(Math.pow(number[0],2));
                }
                else if(range=="below")
                {
                    range_query.range["product_filter.discount_price"].lte = Math.sqrt(Math.pow(number[0],2));
                }
                else if(range=="between" || entities.number.length==2)
                {
                    if(number[0]>number[1])
                    {
                        let temp = number[0];
                        number[0] = number[1];
                        number[1] = temp;
                    }
                    range_query.range["product_filter.discount_price"].gte = Math.sqrt(Math.pow(number[0],2));
                    range_query.range["product_filter.discount_price"].lte = Math.sqrt(Math.pow(number[1],2));
                }
                query.body.query.bool.must.push(range_query);
            }
        fetch_Products(sessionId,benefits,query,product_line,entities, callback);
    });
}

function fetch_Products(sessionId,benefits,query,product_line,entities, callback)
{
    console.log("fetching products for website");
    console.log(JSON.stringify(query,null,2));
    elasticSearch.runQuery(query, function (result_set,total,err)
    {
        console.log(total,err);
        if(err==null)
        {
            let result = [];
            for(let i in result_set) {
                let result_source = result_set[i]["_source"];
                let source = {};
                source["_id"] = result_set[i]["_id"];
                source["product_filter"] = result_source["product_filter"];
                source["style_image"] = result_source["style_image"];
                source["landingPageUrl"] = result_source["pdpData"]["landingPageUrl"];
                source["product_benefits"] = [];
                try
                {
                    for(let pro_benefit in result_source["benefits"])
                    {
                        let name = functions.benefit_name[product_line][result_source["benefits"][pro_benefit]];
                        if(source["product_benefits"].indexOf(name)==-1)
                        {
                            source["product_benefits"].push(name);
                        }
                    }
                }catch(e){}

                if(source["style_image"]==undefined)
                    source["style_image"] = result_source["style_images"];

                //getting least size image url
                let resolutions = function(source)
                {
                    let image_url;
                    let pixel,min_pixels;
                    try{
                        image_url = source["imageURL"];
                        let image_resolutions = source["resolutions"];
                        let res_keys = Object.keys(image_resolutions);
                        min_pixels = 2080;
                        let require_index = 0;
                        for(let res in res_keys)
                        {
                            pixel = parseInt(res_keys[res].split("X")[0]);
                            if(pixel>=360 && pixel<min_pixels)
                            {
                                min_pixels = pixel;
                                require_index = res;
                            }
                        }
                        image_url = image_resolutions[res_keys[require_index]];
                    }catch (e){console.log(e)}
                    return image_url;
                };

                var main_image_url,front_image_url,back_image_url,right_image_url,left_image_url;

                if(source["style_image"]!=undefined)
                {
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
                }
                //Benefits
                source["benefits"] = [];
                for(let ben in benefits)
                {
                    if(result_source["benefits"]!=undefined)
                    {
                        if(result_source["benefits"].indexOf(benefits[ben].name)!=-1)
                        {
                            if(source["benefits"].indexOf(functions.benefit_name[product_line][benefits[ben].name])==-1)
                                source["benefits"].push(functions.benefit_name[product_line][benefits[ben].name]);
                        }
                    }
                }
                result.push(source);
            }
            console.log("Sending products for website message");
            let product_data = {};
            product_data.type = "product_list";
            product_data.list = result;
            product_data.total_length = total;
            sendMessage("browse",product_data,sessionId);

            let count = 0;
            let benefits_result = [];
            let attributes = {};
            let get_products = function(benefits,i)
            {
                let product_query =
                {
                    "index":"styling_rules",
                    "type":"benefit_rules",
                    "body":
                    {
                        "query":{"bool":{"must":[{"match_phrase":{"adjective_name":benefits[i].name}},{"match_phrase":{"product_line_name":product_line}}]}}
                    }
                };
                elasticSearch.runQuery(product_query, function (result_set,total,err)
                {
                    if(err==null)
                    {
                        count++;
                        let source = result_set[0]["_source"];
                        let answer_key = benefits[i].answer_key;
                        let reason =benefits[i].reason;
                        let string = "";

                        let header=get_sub_heading(answer_key,count);
                        string +=get_intro(count);
                        string +="\n"+get_reason(reason);

                        let attribute_dependencies = source["attribute_dependencies"];
                        let filters = {};
                        for(var filter=0;filter<attribute_dependencies.length;filter++)
                        {
                            let attribute_type = attribute_dependencies[filter]["attribute_type"];
                            attribute_type = attribute_type.substr(0, 1).toUpperCase() + attribute_type.substr(1);
                            let attribute_value = attribute_dependencies[filter]["attribute_value"];
                            if(!attributes.hasOwnProperty(attribute_type))
                            {
                                attributes[attribute_type] = [];
                            }
                            if(!filters.hasOwnProperty(attribute_type))
                            {
                                filters[attribute_type] = [];
                            }

                            var val;
                            for(val = 0;val<attribute_value.length-1;val++)
                            {
                                if(attributes[attribute_type].indexOf(attribute_value[val])==-1)
                                    attributes[attribute_type].push(attribute_value[val]);

                                if(filters[attribute_type].indexOf(attribute_value[val])==-1)
                                    filters[attribute_type].push(attribute_value[val]);
                                if(val>3)
                                    break;
                            }
                            if(attributes[attribute_type].indexOf(attribute_value[val])==-1)
                                attributes[attribute_type].push(attribute_value[val]);
                            if(filters[attribute_type].indexOf(attribute_value[val])==-1)
                                filters[attribute_type].push(attribute_value[val]);
                            if(filter>2)
                                break;
                        }
                        string += "\n"+get_filters(filters);
                        benefits_result.push({"header":header,"sentence":string});
                    }
                    else
                    {
                        count++;
                    }
                    if(count==benefits.length)
                    {
                        let message = {"type":"benefits","sentences":benefits_result,"tabular":attributes,"entities":entities};
                        sendMessage("benefits",message,sessionId);
                    }
                    else
                    {
                        get_products(benefits,count);
                    }
                });
            };
            if(benefits.length>0)
                get_products(benefits,count);
            else
            {
                let message = {"type":"benefits","sentences":[{"header":"Buy from amazing and complete web collection of women western wear "+entities["product_line"]+" that suits your style","sentence":""}],"tabular":attributes,"entities":entities};
                sendMessage("benefits",message,sessionId);
            }
        }
    });
}
function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (JSON.stringify(obj) === JSON.stringify(list[i])) {
            return true;
        }
    }
    return false;
}

function get_names_of_keys(answers,product_line)
{
    let string = "";
    let getNumbers = functions.get_number[product_line];
    let number_keys = Object.keys(getNumbers);

    for(let i=0;i<answers.length;i++)
    {
        for(let k in number_keys)
        {
            if(answers[i]==getNumbers[number_keys[k]])
            {
                string += number_keys[k];
                break;
            }
        }
        if(i<answers.length-1)
            string += " --> ";
    }
    return string;
}
function get_sub_heading(string,count)
{
    let sentence =
        [
            "These collections are suitable for: "+ string,
            "The following items are ideal for: "+string,
            "For "+string+" these would be a perfect fit",
            string+": Matching Collections",
            "Suitables Styles: "+string
        ];
    let get_random_number = count%sentence.length;
    return sentence[get_random_number];
}
function get_intro(count)
{
    let sentence =
        [
            "The objective here is to make you look awesome. Simple!",
            "Remember that the selection here is not just for looks. You should also feel great in it.",
            "All we need to do is to find that apt clothing that suits you the best.",
            "While making these clothing choices, we only had one thing in mind. How fabulous will these look on you.",
            "3 simple rules we thought of while selecting these - You should look awesome, feel wonderful and be others' envy."
        ];
    let get_random_number = count%sentence.length;
    return sentence[get_random_number];
}
function get_reason(reason)
{
    let sentence =
        [
            "Go for styles "+reason+".",
            "Pick the ones "+reason+".",
            "Choose clothes "+reason+"."
        ]
    let get_random_number = random(0,sentence.length);
    return sentence[get_random_number];
}
function get_filters(filters)
{
    let attr1,attr_val1,attr2,attr_val2,attr3,attr_val3;
    let filter_keys = Object.keys(filters);
    let s11="",s12="",s13="",s21="",s22="",s23="",s31="",s32="",s33="";
    if(filter_keys.length>0)
    {
        let make_sentence = function(values)
        {
            let str = "";
            if(values.length>0)
            {
                for(let i=0;i<values.length-1;i++)
                {
                    str +=values[i]+", ";
                }
                str +=values[values.length-1];
            }
            return str;
        };
        attr1 = filter_keys[0];
        attr_val1 = make_sentence(filters[filter_keys[0]]);
        s11 = "We have included "+ attr1 + " like "+ attr_val1 +". These would get you those awesome looks. ";
        s21 = "All we did was to select "+attr_val1+" in "+attr1+" to make you look fabulous. ";
        s31 = "Our pick list has "+attr1+" like "+attr_val1+" to increase the stylish aspect. "

        if(filter_keys[1]!=undefined)
        {
            attr2 = filter_keys[1];
            attr_val2 = make_sentence(filters[filter_keys[1]]);
            s12 = "With respect to the "+attr2+" we have chosen "+attr_val2+". They will look good on you. ";
            s22 = "In addition to it, we went for "+attr_val2+" in "+attr2+". They will enhance the look quotient. ";
            s32 = "We also tried to accentuate your good appearance by going for "+attr_val2+" in "+attr2+". "
        }
        if(filter_keys[2]!=undefined)
        {
            attr3 = filter_keys[2];
            attr_val3 = make_sentence(filters[filter_keys[2]]);
            s13 = "Lastly, to give you that extra style, we went for "+attr_val3+" in "+attr3+".";
            s23 = "And last but not the least, we also picked "+attr_val3+" in "+attr3+".";
            s33 = "And when it came to "+attr3+", we chose "+attr_val3+".";
        }
    }
    let sentences =
        [
            s11+s12+s13,

            s21+s22+s23,

            s31+s32+s33
        ];
    let get_random_number = random(0,sentences.length);
    return sentences[get_random_number];
}
function random(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function check_for_productline(message,entities)
{
    let product_line_name =
    {

        "bags": [
            "bags"
        ],
        "blazers": [
            "blazers","blazer"
        ],
        "blouses": [
            "blouses","blouse"
        ],
        "capris": [
            "capris"
        ],
        "casual shoes": [
            "casual shoes",
            "shoe",
            "shoes"
        ],
        "churidars": [
            "churidars","churidar"
        ],
        "coats": [
            "coats","coat"
        ],
        "dresses": [
            "dress",
            "dresses"
        ],
        "dupattas": [
            "dupattas","dupatta"
        ],
        "flats": [
            "flats"
        ],
        "floaters": [
            "floaters"
        ],
        "handbags": [
            "handbags","handbag","hand bags","hand bag"
        ],
        "heels": [
            "heels","heel"
        ],
        "jackets": [
            "jacket",
            "jackets"
        ],
        "jeans": [
            "jean",
            "jeans"
        ],
        "jeggings": [
            "jeggings","jegging"
        ],
        "jumpsuits": [
            "jumpsuits","jumpsuit"
        ],
        "kurtas": [
            "kurta",
            "kurtas",
            "kurtha","kurthas"
        ],
        "kurtis": [
            "kurti",
            "kurtis"
        ],
        "leggings": [
            "leggings"
        ],
        "lehenga choli": [
            "lehenga choli","lehenga"
        ],
        "lingerie": [
            "lingerie"
        ],
        "palazzos": [
            "palazzos","palazzo"
        ],
        "salwars": [
            "salwars","salwar"
        ],
        "sarees": [
            "sarees","saree"
        ],
        "shawls": [
            "shawls","shawl"
        ],
        "shirts": [
            "shirts","shirt"
        ],
        "shorts": [
            "shorts"
        ],
        "shrugs": [
            "shrug",
            "shrugs"
        ],
        "skirts": [
            "skirts","skirt"
        ],
        "sleepwear" : [
            "sleepwear"
        ],
        "sports shoes": [
            "sports shoes","sports shoe","sport shoe","sport shoes"
        ],
        "suits": [
            "suits","suit"
        ],
        "sunglasses": [
            "sunglasses"
        ],
        "sweaters": [
            "sweaters","sweater"
        ],
        "sweatshirts": [
            "sweatshirts","sweatshirt"
        ],
        "tops": [
            "top",
            "tops"
        ],
        "trousers": [
            "trousers","trouser"
        ],
        "tshirts": [
            "tshirt", "t shirt","t-shirt","t-shirts","tee shirts",
            "tshirts","tees","tee shirt"
        ],
        "tunics": [
            "tunic",
            "tunics"
        ],
        "waistcoats": [
            "waistcoats","waist coat","waistcoat","waist coats"
        ],
        "watches": [
            "watches","watch"
        ]
    };
    let product_line = get_result(product_line_name,message);
    if(product_line.length>0)
    {
        entities["product_line"] = product_line[0];
        message = product_line[1];
    }
    return [entities,message];
}

function check_for_broad_occasion(message,entities)
{
    let broad_occasion_name =
    {
        "beach": [
            "beach",
            "beach wear"
        ],
        "casual_wear": [
            "casualwear",
            "casual wear",
            "casual_wear"
        ],
        "festival": [
            "diwali",
            "festival",
            "festive",
            "pongal",
            "sankranti"
        ],
        "haldi": [
            "haldi"
        ],
        "hangout": [
            "hang out",
            "hangout",
            "hangouts"
        ],
        "job_interview": [
            "job interview",
            "job_interview"
        ],
        "office_wear": [
            "corporate events",
            "office",
            "office events",
            "office wear",
            "work",
            "work wear",
            "office_wear"
        ],
        "party_wear": [
            "party",
            "party_wear"
        ],
        "physical_activity": [
            "physical activity",
            "physical_activity"
        ],
        "sangeet": [
            "sangeet"
        ],
        "special_occasion": [
            "special occasion",
            "special occasions",
            "special_occasion"
        ],
        "vacation": [
            "travel",
            "vacation"
        ],
        "wedding": [
            "engagement",
            "wedding"
        ],
        "wedding_reception": [
            "reception",
            "wedding reception",
            "wedding_reception"
        ]
    };
    let broad_occasion = get_result(broad_occasion_name,message);
    if(broad_occasion.length>0)
    {
        entities["broad_occasion"] = broad_occasion[0];
        message = broad_occasion[1];
    }
    return [entities,message];
}
function check_for_occasion(message,entities)
{
    let occasion_name =
    {
        "simple":["simple"],
        "office_wear": [
        "office_wear",
        "office wear",
        "office-wear",
        "work"
        ],
        "casual_wear": [
        "casual_wear",
        "casual wear",
        "casual-wear",
        "casual"
        ],
        "formal": [
        "formal"
        ],
        "semi_formal": [
        "semi_formal",
        "semi-formal", "semi formal"
        ],
        "casual_office": [
        "casual_office",
        "casual"
        ],
        "lunch": [
        "lunch"
        ],
        "brunch_brunch": [
        "brunch_brunch",
        "brunch"
        ],
        "dinner": [
        "dinner"
        ],
        "movie_movie": [
        "movie_movie",
        "movie"
        ],
        "daily_wear_type": [
        "daily_wear_type",
        "daily wear",
        "daily-wear",
        "daily use",
        "daily-use"
        ],
        "college_college": [
        "college_college",
        "college",
        "college wear",
        "college-wear"
        ],
        "vacation": [
        "vacation",
        "holiday trips",
        "holiday-trips",
        "holidays",
        "travel"
        ],
        "beach": [
        "beach",
        "beach wear",
        "beach-wear",
        "beach use",
        "beach-use"
        ],
        "party_wear": [
        "party_wear",
        "party wear",
        "party-wear",
        "party"
        ],
        "date_night_date_night": [
        "date_night_date_night",
        "date"
        ],
        "cocktail": [
        "cocktail"
        ],
        "cocktail_events_office_circle": [
        "cocktail_events_office_circle",
        "office party",
        "office-party"
        ],
        "clubbing": [
        "clubbing"
        ],
        "theme_party_house": [
        "theme_party_house",
        "house party",
        "house-party"
        ],
        "college_party": [
        "college_party",
        "college party",
        "college-party"
        ],
        "birthday": [
        "birthday",
        "birthday party",
        "birthday-party"
        ],
        "anniversary_dinner_partner": [
        "anniversary_dinner_partner",
        "anniversary",
        "anniversary party",
        "anniversary-party"
        ],
        "pool_party_pool_party": [
        "pool_party_pool_party",
        "pool party",
        "pool-party"
        ],
        "summer": [
        "summer",
        "hot"
        ],
        "winter": [
        "winter",
        "cold"
        ],
        "workout": [
        "workout",
        "sports wear",
        "sports-wear",
        "active wear",
        "active-wear",
        "workout wear",
        "workout-wear"
        ],
        "concerts_concerts": [
        "concerts_concerts",
        "others"
        ],
        "Casual Wear": [
        "Casual Wear",
        "daily wear casual",
        "daily-wear casual"
        ],
        "special_occasion": [
        "special_occasion",
        "special events",
        "special-events",
        "special occasion wear",
        "special-occasion wear",
        "special occasion",
        "special-occasion"
        ],
        "wedding": [
        "wedding",
        "weddings"
        ],
        "simple_wedding": [
        "simple_wedding",
        "simple"
        ],
        "heavy_wedding": [
        "heavy_wedding",
        "heavy"
        ],
        "festival": [
        "festival",
        "festivals"
        ],
        "indoor_sports": [
        "indoor_sports",
        "indoor sports",
        "indoor-sports"
        ],
        "gym": [
        "gym"
        ],
        "yoga_class_yoga_class": [
        "yoga_class_yoga_class",
        "yoga"
        ],
        "dance_class_aerobics": [
        "dance_class_aerobics",
        "aerobics"
        ],
        "outdoor_sports": [
        "outdoor_sports",
        "outdoor sports",
        "outdoor-sports"
        ],
        "trekking_trekking": [
        "trekking_trekking",
        "trekking"
        ],
        "mountain_climbing": [
        "mountain_climbing",
        "mountain climbing",
        "mountain-climbing"
        ],
        "swimming": [
        "swimming"
        ],
        "cycling": [
        "cycling"
        ],
        "snow_vacation": [
        "snow_vacation",
        "extreme cold",
        "extreme-cold"
        ],
        "windy": [
        "windy"
        ],
        "monsoon": [
        "monsoon",
        "rainy"
        ]
    };
    let occasion = get_result(occasion_name,message);
    if(occasion.length>0)
    {
        entities["occasion"] = occasion[0];
        message = occasion[1];
    }
    return [entities,message];
}
function check_for_range(message, entities)
{
    let range = ["above","below","between"];
    for(var i in range)
    {
        if(message.indexOf(range[i])!=-1)
        {
            entities["range"] = range[i];
            break;
        }
    }
    try{
        let numbers = message.match(/[0-9]+/g);
        if(numbers.length>0)
            entities["number"] = numbers;
    }catch(e){}
    return [entities, message];
}
function check_for_attribute(message,entities,product_line)
{
    let attribute_values = Object.keys(mapping.attribute_value_default_keys[product_line]);
    attribute_values = attribute_values.sort(function(a, b){return b.length - a.length;});

    for(let i in attribute_values)
    {
        if(message.indexOf(attribute_values[i])!=-1 && (message[message.indexOf(attribute_values[i])-1]==" " || message[message.indexOf(attribute_values[i])-1]=="-" || message.indexOf(attribute_values[i])==0) && (message[message.indexOf(attribute_values[i])+attribute_values[i].length]==" " || message[message.indexOf(attribute_values[i])+attribute_values[i].length]=="-" || message.indexOf(attribute_values[i])+attribute_values[i].length==message.length))
        {
            if(!entities.hasOwnProperty("attribute_value"))
            {
                entities["attribute_value"] = [];
            }
            entities["attribute_value"].push(attribute_values[i]);
            message = message.replace(attribute_values[i],"");
        }
    }
    return [entities,message];
}
function check_for_profile_benefits(message,entities)
{
    return [entities,message];
}
function get_result(obj,message)
{
    let key,msg = message;
    let obj_keys  = Object.keys(obj);
    obj_keys.sort(function(a, b){return b.length - a.length;});
    for(let i in obj_keys)
    {
        let values = obj[obj_keys[i]];
        for(let j in values)
        {
            if(msg.indexOf(values[j])!=-1 )
            {
                msg = msg.replace(values[j],"");
                key = obj_keys[i];
                return [key,msg];
            }
        }
    }
    return [];
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

module.exports = {
    webProcessMessage: webProcessMessage,
    getEntities:getEntities,
    random:random
};