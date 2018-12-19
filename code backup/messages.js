
function listMessage(key){
    "use strict";
    var afterList = [];
    afterList.push("You can ask specific details about any of these models. eg: average rating of Galaxy S7." +
        " For comparing type 'compare Galaxy S7 and moto G'");
    afterList.push("You can ask for specs, ratings and prices across sites for these models. eg: specs of Moto G (or) camera specs of oneplus one." +
        " For comparing type 'compare Galaxy S7 and moto G'");
    afterList.push("You can ask specs of any model. eg: what is the processor of Moto X. For comparing type 'compare Galaxy S7 and moto G'" +
        " & to reset the conversation type 'clear'");

    var afterMessage = [];
    afterMessage.push("You can ask more details. eg: 'highlights of a specific model' or 'camera specs of Oneplus X' or 'what does a processor mean'" );
    afterMessage.push("You can ask specific features and reviews for this model");
    afterMessage.push("Want to know more? eg: 'what is a processor' or 'what is RAM'");
    afterMessage.push("You can ask reviews and specs for any of the models you are interested in");
    afterMessage.push("You can ask 'what are the pros of a specific model' or 'what does a processor mean'");


    // var beforeList = [];
    // beforeList.push("There you go. Scroll up to browse through your list");
    // beforeList.push("Here is your list");
    // beforeList.push("List is ready :)");
    // beforeList.push("Here is the list. Scroll up to check");
    // beforeList.push("Here is your selection");
    // beforeList.push("Here is your selection");
    // beforeList.push("Here is your selection");
    // beforeList.push("Here is what you are looking for");
    // beforeList.push("Here is your selection. Scroll up to check");

    var compareList = [];
    compareList.push("Here is the comparison that you asked for");
    compareList.push("The comparison that you are looking for");
    compareList.push("A short comparison");
    compareList.push("A few important differences");
    compareList.push("Giving you a few important differences");
    compareList.push("Here is the comparison");
    compareList.push("A few important differences");
    compareList.push("A few differences");
    compareList.push("Differences");
    compareList.push("Comparison");

    var greetingsMessage = [
        "Hello"
    ];

    var msg;
    var rand;
    if(key == 'notFound'){
        msg =   "Sorry I didn't get you. Please help me understand your requirements better";
        return msg;
    } else if(key == 'clear'){
        msg = 'Cleared';
        return msg;
    } else if(key == 'aboveList'){
        msg = "Do you want in the above list? Y or N?";
        return msg;
    } else if( key == 'priceRange'){
        // msg = "What is the price range you are looking for ?(eg. above 20k, below 20k, 20k to 30k, around 20k)";
        msg = "What is the price range you are looking for ?";
        return msg;
    } else if( key == 'priceRangeCheap'){
        msg = "What price range is cheap according to you?";
        return msg;
    } else if( key == "notAvailable"){
        msg = "Oops! No phones are available as per your requirements";
        return msg;
    // } else if(key == 'beforeList'){
    //     rand = Math.floor(Math.random() * beforeList.length)
    //     return beforeList[rand];
    } else if(key == 'afterList') {
        rand = Math.floor(Math.random() * afterList.length);
        return afterList[rand];
    }else if(key == 'compare'){
        rand = Math.floor(Math.random() * compareList.length);
        return compareList[rand];
    }else if( key == 'point'){
        msg = "Sure, Here is the info";
        return msg;
    }else if( key == 'afterMessage'){
        rand = Math.floor(Math.random() * afterMessage.length);
        return afterMessage[rand];
    } else if( key == 'correct'){
        msg  ="Please correct the sentence and type the complete sentence again";
        return msg;
    } else if( key == 'noInfo'){
        msg  ="Sorry! Information not available";
        return msg;
    } else if(key == 'greet'){
        msg ="Hello";
        return msg;
    } else if(key == 'listQuestMessage'){
        msg =  "Do you want in the above list? Y or N?";
        return msg;
    } else if(key == 'brandPrefMessage'){
        msg = "Remove the brands you don't want to check by typing the corresponding number or type '0' to include all brands";
        return msg;
    } else if( key == "priceRangeMessage"){
        msg = "What is the price range you are looking for?";
        return msg;
    } else if(key == "noRating"){
        msg =  "No ratings are available.";
        return msg;
    } else if(key == "negExp"){
        msg =   "Sorry for that :( You can ask specific details of any model." +
            " eg: what is the processor of oneplus one";
        return msg;
    } else if(key =="help"){
        msg = "Hey, I am ProdX. You can interact with me as you would with a salesman and get recommendations on mobile phones";
        return msg;
    } else if(key == "clear"){
        msg = "Cleared";
        return msg;
    } else if(key == "ageHe"){
        msg = "How old is he?";
        return msg;
    } else if(key == "ageShe"){
        msg = "How old is she?";
        return msg;
    }else if(key == "age"){
        msg = "How old?";
        return msg;
    // }else if(key == "scroll"){
    //     msg = "Please scroll up to see the results.";
    //     return msg;
     }else if(key == "presentSKUQuestion"){
        msg = "What's the present mobile you are looking to replace ?";
        return msg;
    } else if (key == "sorryMessage"){
        msg = "Unable to interpret the sentence. Can you please rephrase it as a simple sentence and ask again?";
        return msg;
    } else if(key == "scroll") {
            msg = "Please scroll up to see the results.";
            return msg;
    }
}

function messageKeyValue(key,value){
    if(key == "listSize"){
        return " list size: " + value;
    } else if(key == "listLength"){
        return "There are " + value + " phones in this price range"
    } else if(key == "listReason"){
        return "List is sorted based on " + value + " values available in your price range";
    } else if(key == "enquiry"){
        if(value == "one") return "Before showing you the results, please answer " + value +" simple question to know your preferences better.";
        return "Before showing you the results, please answer " + value +" simple questions to know your preferences better. Answer them one by one."
    } else if("bestAttribute"){
        return "Best " + value +" is ranked using the scores from popular benchmarks AnTuTu and Notebookcheck";
    }
}

var triviaReplies = {
    'who are you'	:	"Hey, I am ProdX. You can interact with me as you would with a salesman and get recommendations on mobile phones",
    'how are you'	:	"I am doing great. I can assist you to buy a smart phone. You can ask me anything about mobiles like 'Show me good phones around 15000', 'Suggest the best camera phones'",
    'i love you'	:	"I love you too <3 <3",
    'what do you do'	:	"I can assist you to buy a smart phone, You can ask me anything about mobiles like 'Show me good phones around 15000', 'Suggest the best camera phones'",
    'what can you do'	:	"I can assist you to buy a smart phone, You can ask me anything about mobiles like 'Show me good phones around 15000', 'Suggest the best camera phones'",
    'how can you help me'	:	"I can assist you to buy a smart phone, You can ask me anything about mobiles like 'Show me good phones around 15000', 'Suggest the best camera phones'",
    'others'	:	"I am sorry, I cannot answer that. My creators made me capable of answering questions on smart phones only"
};

var browseMessages = {
    "positiveSKU" : "Scroll below to view full details about <<sku>>",
    "negativeSKU" : "Scroll below to view full details about <<sku>>",
    "opinionSKU" : "Scroll below to view full details about <<sku>>",
    "getAttributeValueSKU" : "Scroll below to view full details about <<sku>>",
    "singlePhoneDetails" : "Scroll below to view full details about <<sku>>",
    "specsOfSKU" : "Scroll below to view full details about <<sku>>",
    "specReview":"Scroll below to view full details about <<sku>>",
    "SKUReview":"Scroll below to view full details about <<sku>>",
    "howSpecs":"Scroll below to view full details about <<sku>>",
    "checkAttributeSKU" : "Scroll below to view full details about <<sku>>",
    "dimensionsSKU": "Scroll below to view full details about <<sku>>",
    "publicTalk" : "Scroll below to view full details about <<sku>>",
    "ratingMobile" : "Scroll below to view full details about <<sku>>",
    "compareMobiles" : "Scroll below to view full spec-wise comparison",
    "betterPhoneInTwo" : "scroll below to view full spec-wise comparison",
    "betterThanSKU": "scroll below to view the phone list",
    "betterThanPhone":"scroll below to view the phone list",
    "findGenderMobile" : "scroll below to view the phone list",
    "similarPhones" : "scroll below to view the phone list",
    "sortPhoneList" : "scroll below to view the sorted list"
};

function whyListMessage(key){
    "use strict";
    var send_msg = " These results are based on "+ key+" scores from Phoneradar.com and buysmaart.com. Re-ranked them again after validating the scores from" +
        " digit.in, pcadvisor.com, 91mobiles.com, smartprix.com";
    return send_msg;
}

function complexSentenceReply(key){
    "use strict";
    var send_msg = "Unable to interpret '" + key + "' in a sentence. Can you please rephrase and ask again?";
    return send_msg;
}

function triviaReply(key){
    "use strict";
    var key_list = Object.keys(triviaReplies);
    console.log(key_list);
    if(triviaReplies[key] != null) return triviaReplies[key];
    return triviaReplies['others'];
}

function getBrowseMessage(function_name, context){
    "use strict";

    console.log("--===----=== Running browse message function --===----=== ");
    if(browseMessages[function_name] == null) return null;
    var browse_message = browseMessages[function_name];
    var key_list = Object.keys(context);

    for(var i in key_list) {
        var key = key_list[i];
        var find = "<<" + key + ">>";
        var re = new RegExp(find, 'g');
        browse_message = browse_message.replace(re, context[key]);
    }
    return browse_message;
}

var drill_down_pointers = {
    "findAllPhones" : ["Compare 1 and 2", "Compare camera specs of 1 and 2", "Which is better in 1 and 2", "Specifications of model 1", ],
    "findGenderMobile" : ["Compare 1 and 2", "Compare camera specs of 1 and 2", "Which is better in 1 and 2", "Specifications of model 1"],
    "similarPhones" : ["Compare 1 and 2", "Compare camera specs of 1 and 2", "Which is better in 1 and 2", "Specifications of model 1"],
    "betterThanSKU" : ["Compare 1 and 2", "Compare camera specs of 1 and 2", "Which is better in 1 and 2", "Specifications of model 1"],
    "sortPhoneList" : ["Compare 1 and 2", "Compare camera specs of 1 and 2", "Which is better in 1 and 2", "Specifications of model 1"],

    "compareMobiles" : ["Expert review of <<sku1>>", "User reviews of <<sku1>>", "Camera review of <<sku2>>"],
    "betterPhoneInTwo" : ["Expert review of <<sku1>>", "User reviews of <<sku1>>", "Camera review of <<sku2>>"],

    "getAttributeValueSKU" :["Expert review <<sku>>", "User reviews of <<sku>>", "Camera features of <<sku>>", "<<attribute>> of iPhone 6", "Camera features of <<sku>>", "what do you think of <<sku>>", "highlights of <<sku>>", "specifications of <<sku>>"],
    "specReview" :["Expert review <<sku>>", "User reviews of <<sku>>", "RAM of <<sku>>", "Camera features of <<sku>>", "what do you think of <<sku>>", "highlights of <<sku>>", "specifications of <<sku>>"],
    "ratingMobile" :["Expert review <<sku>>", "User reviews of <<sku>>", "Internal memory of <<sku>>", "Camera features of <<sku>>", "what do you think of <<sku>>", "highlights of <<sku>>", "specifications of <<sku>>"],
    "positiveSKU" :["Expert review <<sku>>", "User reviews of <<sku>>", "Processor of <<sku>>", "Camera features of <<sku>>", "what do you think of <<sku>>", "highlights of <<sku>>", "specifications of <<sku>>"],
    "negativeSKU" :["Expert review <<sku>>", "User reviews of <<sku>>", "Camera resolution of <<sku>>", "Camera features of <<sku>>", "what do you think of <<sku>>", "highlights of <<sku>>", "specifications of <<sku>>"],
    "opinionSKU" :["Expert review <<sku>>", "User reviews of <<sku>>", "Camera resolution of <<sku>>", "Camera features of <<sku>>", "what do you think of <<sku>>", "highlights of <<sku>>", "specifications of <<sku>>"],
    "publicTalk" :["Expert review <<sku>>", "User reviews of <<sku>>", "Camera resolution of <<sku>>", "Camera features of <<sku>>", "what do you think of <<sku>>", "highlights of <<sku>>", "specifications of <<sku>>"],
    "SKUReview" :["Expert review <<sku>>", "User reviews of <<sku>>", "RAM of <<sku>>", "Camera features of <<sku>>", "what do you think of <<sku>>", "highlights of <<sku>>", "specifications of <<sku>>"],
    "howSpecs" :["Expert review <<sku>>", "User reviews of <<sku>>", "RAM of <<sku>>", "Camera features of <<sku>>", "what do you think of <<sku>>", "highlights of <<sku>>", "specifications of <<sku>>"],

    "singlePhoneDetails" : ["Expert review <<sku>>", "User reviews of <<sku>>", "Battery review of <<sku>>", "Ram of <<sku>>", "Camera features of <<sku>>", "highlights of <<sku>>"],
    "specsOfSKU" : ["Expert review <<sku>>", "User reviews of <<sku>>", "Battery review of <<sku>>", "Ram of <<sku>>", "Camera features of <<sku>>", "highlights of <<sku>>"],
    "dimensionsSKU" : ["Expert review <<sku>>", "User reviews of <<sku>>", "Battery review of <<sku>>", "Ram of <<sku>>", "Camera features of <<sku>>", "highlights of <<sku>>"],
    "checkAttributeSKU" :["Expert review <<sku>>", "User reviews of <<sku>>", "Battery review of <<sku>>", "Ram of <<sku>>", "Camera features of <<sku>>", "highlights of <<sku>>"],

    "getAttributeValueALL" : ["Expert review of 1", "User reviews of 1", "Performance review of 1", "Processor of 1", "Camera features of 1", "highlights of 1", "specifications of 1"],
    "knowledgeQuestion" : ["Best Phones with 3 GB RAM", "Best Gaming phones", "Phones that can take great pictures", "Best selfie phones"],

    "bestAttributeInMarket" : ["Best android phones", "Phones with good display", "Phones that can take great pictures", "Best selfie phones"],
    "attributeList" : ["Best android phones", "Phones with good display", "Phones that can take great pictures", "Best selfie phones"],
    "greet" : ["Best android phones", "Phones with good display", "Phones that can take great pictures", "Best selfie phones"],
    "posExpression" : ["Best android phones", "Phones with good display", "Phones that can take great pictures", "Best selfie phones"],
    "negExpression" : ["Best android phones", "Phones with good display", "Phones that can take great pictures", "Best selfie phones"],
    "profanity" : ["Best android phones", "Phones with good display", "Phones that can take great pictures", "Best selfie phones"],
    "destroyEverything" : ["Best android phones", "Phones with good display", "Phones that can take great pictures", "Best selfie phones"],
    "helpMessage" : ["Best android phones", "Phones with good display", "Phones that can take great pictures", "Best selfie phones"],
    "trivia" : ["Best android phones", "Phones with good display", "Phones that can take great pictures", "Best selfie phones"],
    "complex_sentence" : ["Best android phones", "Phones with good display", "Phones that can take great pictures", "Best selfie phones"],
    "buyPhone" : ["Best android phones", "Phones with good display", "Phones that can take great pictures", "Best selfie phones"]
};


var broad_pointers = {
    "findAllPhones" : ["What is RAM?", "Phones that can save lot of data", "Does iPhone 6 support dual sim", "Does Moto X support 4g", "Need to upgrade my current phone", "water resistant phones", "what is snapdragon 810" ],
    "findGenderMobile" : ["What is RAM?", "Phones that can save lot of data", "Does iPhone 6 support dual sim", "Does Moto X support 4g", "Need to upgrade my current phone", "water resistant phones", "what is snapdragon 810" ],
    "similarPhones" : ["What is RAM?", "Phones that can save lot of data", "Does iPhone 6 support dual sim", "Does Moto X support 4g", "Need to upgrade my current phone", "water resistant phones", "what is snapdragon 810" ],
    "betterThanSKU" : ["What is RAM?", "Phones that can save lot of data", "Does iPhone 6 support dual sim", "Does Moto X support 4g", "Need to upgrade my current phone", "water resistant phones", "what is snapdragon 810" ],
    "sortPhoneList" : ["What is RAM?", "Phones that can save lot of data", "Does iPhone 6 support dual sim", "Does Moto X support 4g", "Need to upgrade my current phone", "water resistant phones", "what is snapdragon 810" ],

    "compareMobiles" : ["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "betterPhoneInTwo" : ["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "getAttributeValueSKU" :["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "specReview" :["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "ratingMobile" :["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "positiveSKU" :["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "negativeSKU" :["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "opinionSKU" :["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "publicTalk" :["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "SKUReview" :["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "howSpecs" :["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],

    "singlePhoneDetails" : ["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "specsOfSKU" : ["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "dimensionsSKU" : ["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],
    "checkAttributeSKU" :["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],

    "getAttributeValueALL" : ["Best dual sim mobiles", "best android mobiles", "What is RAM", "Phones that can save lot of data", "Need to upgrade my current phone", "water resistant phones"],

    "knowledgeQuestion" : ["Phones that can save lot of data", "Phones that can detect faces automatically", "Phones with huge storage", "Water resistant phones", "Need a better mobile than my current mobile"],

    "bestAttributeInMarket" : ["Phones that can save lot of data", "Phones that can detect faces automatically", "Phones with huge storage", "Water resistant phones", "Need a better mobile than my current mobile"],
    "attributeList" : ["Phones that can save lot of data", "Phones that can detect faces automatically", "Phones with huge storage", "Water resistant phones", "Need a better mobile than my current mobile"],
    "greet" : ["Phones that can save lot of data", "Phones that can detect faces automatically", "Phones with huge storage", "Water resistant phones", "Need a better mobile than my current mobile"],
    "posExpression" : ["Phones that can save lot of data", "Phones that can detect faces automatically", "Phones with huge storage", "Water resistant phones", "Need a better mobile than my current mobile"],
    "negExpression" : ["Phones that can save lot of data", "Phones that can detect faces automatically", "Phones with huge storage", "Water resistant phones", "Need a better mobile than my current mobile"],
    "profanity" : ["Phones that can save lot of data", "Phones that can detect faces automatically", "Phones with huge storage", "Water resistant phones", "Need a better mobile than my current mobile"],
    "destroyEverything" : ["Phones that can save lot of data", "Phones that can detect faces automatically", "Phones with huge storage", "Water resistant phones", "Need a better mobile than my current mobile"],
    "helpMessage" : ["Phones that can save lot of data", "Phones that can detect faces automatically", "Phones with huge storage", "Water resistant phones", "Need a better mobile than my current mobile"],
    "trivia" : ["Phones that can save lot of data", "Phones that can detect faces automatically", "Phones with huge storage", "Water resistant phones", "Need a better mobile than my current mobile"],
    "complex_sentence" : ["Phones that can save lot of data", "Phones that can detect faces automatically", "Phones with huge storage", "Water resistant phones", "Need a better mobile than my current mobile"],
    "buyPhone" : ["Phones that can save lot of data", "Phones that can detect faces automatically", "Phones with huge storage", "Water resistant phones", "Need a better mobile than my current mobile"],
};



function hasUseCaseQuests(key){
    return key in useCaseQuestions;
}
function getUseCaseQuestions(key){
        return useCaseQuestions[key];

}

function isUseCaseQuestionExists(key){
    return (key in useCaseQuestions);
}
var useCaseQuestions = {
    camera : {
        front_camera_pref : "Do you click lot of selfies or do frequent video calls ?",
        video_recording_pref :"Do you use your phone to record videos frequently ?",
        photo_storage_pref :"Do you store lot of pictures/videos on phone ?"
    },

    performance :{
        gaming : "What kind of games do you usually play?",
        app_running : "Most probably ,which of the following apps do  you run simultaneously ?",
//        spend_time : "You spend most of your time on "
    },

    battery : {
        network_type : "Which of the following do you use frequently ?",
        spend_time_battery : " You spend most of the time on phone on",
    },

    "front camera resolution" : {
        record_videos : "Do you frequently record videos using your phone?",
        after_camera_important : "Apart from camera, which of among these is most important to you?"
    },

    display : {
        frequent_use_activity : "Which among the following activities do you engage most frequently on mobile? ",
        use_phone_light : "You use your phone mostly in"
    },

    memory :{
        relevant_internal_memory : "Pick the ones that are most relevant to you.",
        micro_sd_card_cost : "Which among the following micro sd cards will you buy?"
    }

};

var useCaseAnswers = {
    front_camera_pref : {
        type : "buttons",
        questions :["Yes, I do", "Occasionally", "Very rare"],
        header_question :"Do you click lot of selfies or do frequent video calls ?"
    },
    video_recording_pref : {
        type: "buttons",
        questions:["Yes, I do", "Occasionally", "Very rare"],
        header_question :"Do you use your phone to record videos frequently ?",

    } ,
    photo_storage_pref : {
        type: "buttons",
        questions: ["Yes, I do", "Occasionally", "Very rare"],
        header_question :"Do you store lot of pictures/videos on phone ?"
    },
    gaming : {
        type: "checklist",
        max_select : 8,
        questions: [" High-end games (Asphalt, NFS most-wanted )",
            " Low-end games (Candycrush, stick cricket ) ",
            "I don't play games on mobile"],
        header_question :"What kind of games do you usually play?"

    },
    app_running: {
        type: "checklist",
        max_select : 8,
        questions: [" Social Networking apps (Eg: Facebook, Whatsapp, Snapchat)",
        " Low end gaming apps (Eg: Stick cricket, candycrush, mindgames)",
        " E-commerce Apps (Eg: Flipkart, Amazon, Myntra) ",
        " Entertainment apps (Eg: Netflix,hotstar, star sports) ",
        " High end gaming apps (Eg:Asphalt, Modern combat, FIFA)" ],
        header_question :"Most probably ,which of the following apps do  you run simultaneously ?",

    },
    spend_time: {
        type: "checklist",
        max_select : 8,
        questions: ["Gaming ",
            " Watching movies",
            " Entertainment apps like Netflix,starsports, hotstar etc.,",
            " Chatting /Social Networking/E-commerce ", "others"],
        header_question : " You spend most of the time on phone on"

    },
    network_type : {
        type: "checklist",
        max_select : 8,
        questions:["3G/4G", " Office/Home Wifi", "2G"],
        header_question : "Which of the following do you use frequently ?",
    },
    spend_time_battery: {
        type: "checklist",
        max_select : 8,
        questions: ["Gaming ",
            " Watching movies/youtube",
            " Social Networking/E-commerce/Browsing",
            " Listening to music ", " Phone calls/Chatting"],
        header_question : " You spend most of the time on phone on",

    },

    record_videos: {
        type: "buttons",
        questions: ["Yes, I do", "Occasionally", "Very rare"],
        header_question :"Do you frequently record videos using your phone?",

    },
    after_camera_important: {
        type: "buttons",
        questions: ["Battery", "Performance", "Display", "Nothing"],
        header_question :"Apart from camera, which of among these is most important to you?"
    },

    frequent_use_activity : {
        type : "checklist",
        max_select : 8,
        questions : [ " Watch videos/Youtube /movies ",
                     " Reading/Heavy Browsing ", " Gaming ",
                     " Food - ordering/E-commerce"," Chatting "," Social Networking "],
        header_question : "Which among the following activities do you engage most frequently on mobile? ",

    },

    use_phone_light : {
        type : "checklist",
        max_select : 8,
        questions : ["Sun light (outdoor, travelling etc)",
            " Dim light  (in a room, in a room with light,night time etc) ",
            " Nothing in particular, anytime " ],
        header_question :"You use your phone mostly in"
    },
    relevant_internal_memory : {
        type : "checklist",
        max_select : 8,
        questions : ["I play high-end games like Asphalt,Modern Combat, FIFA etc ",
            " I play low end games like candy crush, stick cricket, angry birds etc.",
            " I store a lot videos/Movies in my phone", " I store a lot of pics/music in my phone ",
            " I install more than 100 apps in my phone ",
            " I install less than 100 apps in my phone "],
        header_question : "Pick the ones that are most relevant to you"
    },
    micro_sd_card_cost : {
        type :"checklist",
        max_select : 1,
        questions : [ "8 GB (Rs.150)", "16 GB (Rs.300)", "32 GB (Rs.500)", "64 GB (Rs.1200)",
            "128 GB (Rs. 2700)", "I don't want to buy any micro sd card. "],
        header_question : "Which among the following micro sd cards will you buy?"
    }
};

var headerMessagesForAttributeValues = {
    'pros' : "These are the highlights of <<sku>>"
};

function getUseCaseAnswer(key){
    return useCaseAnswers[key];
}

function getHeaderMessageForAttributeValue(key, context) {
    "use strict";
    var message = headerMessagesForAttributeValues[key];
    if(message == null) message = "";
    return replaceKeyWithValueInMessage(message, context);
}

function doesHaveMessageForAttribute(key){
    return key in headerMessagesForAttributeValues;
}

function getPointerMessage(localContext,function_name, context, messages) {
    var drill_down_message_1, drill_down_message_2, broad_message;

    var drill_down_pointers_for_function = drill_down_pointers[function_name];
    var broad_pointers_for_function = broad_pointers[function_name];

    if(drill_down_pointers_for_function == null || broad_pointers_for_function == null){
        return "";
    }

    var rand = Math.floor(Math.random() * drill_down_pointers_for_function.length);
    drill_down_message_1 = drill_down_pointers_for_function[rand];

    while(drill_down_message_2 == null || drill_down_message_2 == drill_down_message_1){
        rand = Math.floor(Math.random() * drill_down_pointers_for_function.length);
        drill_down_message_2 = drill_down_pointers_for_function[rand];
    }

    rand = Math.floor(Math.random() * broad_pointers_for_function.length);
    broad_message = broad_pointers_for_function[rand];

    var key_list = Object.keys(context);

    for(var i in key_list) {
        var key = key_list[i];

        var find = "<<" + key + ">>";
        var re = new RegExp(find, 'g');

        drill_down_message_1 = drill_down_message_1.replace(re, context[key]);
        drill_down_message_2 = drill_down_message_2.replace(re, context[key]);
        broad_message = broad_message.replace(re, context[key]);
    }


    return "You can ask questions like: \n " +
        "- " + drill_down_message_1 + "\n - " + drill_down_message_2 + "\n - " + broad_message;
}

function getPointers(localContext,function_name, context, messages) {
    var drill_down_message_1, drill_down_message_2, broad_message;

    var drill_down_pointers_for_function = drill_down_pointers[function_name];
    var broad_pointers_for_function = broad_pointers[function_name];

    if(drill_down_pointers_for_function == null || broad_pointers_for_function == null){
        return "";
    }

    var rand = Math.floor(Math.random() * drill_down_pointers_for_function.length);
    drill_down_message_1 = drill_down_pointers_for_function[rand];

    while(drill_down_message_2 == null || drill_down_message_2 == drill_down_message_1){
        rand = Math.floor(Math.random() * drill_down_pointers_for_function.length);
        drill_down_message_2 = drill_down_pointers_for_function[rand];
    }

    rand = Math.floor(Math.random() * broad_pointers_for_function.length);
    broad_message = broad_pointers_for_function[rand];

    var key_list = Object.keys(context);

    for(var i in key_list) {
        var key = key_list[i];

        var find = "<<" + key + ">>";
        var re = new RegExp(find, 'g');

        drill_down_message_1 = drill_down_message_1.replace(re, context[key]);
        drill_down_message_2 = drill_down_message_2.replace(re, context[key]);
        broad_message = broad_message.replace(re, context[key]);
    }

    return [drill_down_message_1,drill_down_message_2,broad_message];
}

function listFooter(key){
    "use strict";
    var msg ;
    if(key == 0) msg =  "These results are based on phone scores from Phoneradar.com and buysmaart.com. Re-ranked them again after validating the scores from" + " digit.in, pcadvisor.com, 91mobiles.com, smartprix.com ";
    else msg =  "These results are based on the specs scores from popular mobile review sites like 91mobiles.com, pcadvisor.com, digit.in etc.";
    return msg;
}

function ratingMessage(sku,rating){
    return "The average user rating of " + sku + " is " + rating;
}

function replaceKeyWithValueInMessage(message, context) {
    var key_list = Object.keys(context);

    for(var i in key_list) {
        var key = key_list[i];
        var find = "<<" + key + ">>";
        var re = new RegExp(find, 'g');
        message = message.replace(re, context[key]);
    }
    return message;
}


function countMessages(question_count){
    var message ;
    if(question_count == 1)
      message =  messageKeyValue("enquiry","one");
    if(question_count == 2)
      message =  messageKeyValue("enquiry","two");
    if(question_count == 3)
      message =  messageKeyValue("enquiry","three");
    if(question_count == 4)
      message =  messageKeyValue("enquiry","four") ;
    if(question_count == 5)
     message =  messageKeyValue("enquiry","five");
    if(question_count == 6)
      message =  messageKeyValue("enquiry","six");
    if(question_count == 7)
        message =  messageKeyValue("enquiry","seven");
    if(question_count == 8)
        message =  messageKeyValue("enquiry","eight");
    if(question_count == 9)
        message =  messageKeyValue("enquiry","nine");
    return message;
}
module.exports = {
    listMessage:listMessage,
    whylistMessage:whyListMessage,
    listFooter:listFooter,
    triviaReply:triviaReply,
    complexSentenceReply:complexSentenceReply,
    getPointerMessage:getPointerMessage,
    messageKeyValue:messageKeyValue,
    getPointers:getPointers,
    getBrowseMessage:getBrowseMessage,
    ratingMessage:ratingMessage,
    getHeaderMessageForAttributeValue:getHeaderMessageForAttributeValue,
    useCaseQuestions:useCaseQuestions,
    getUseCaseAnswer:getUseCaseAnswer,
    isUseCaseQuestionExists:isUseCaseQuestionExists,
    getUseCaseQuestions:getUseCaseQuestions,
    doesHaveMessageForAttribute:doesHaveMessageForAttribute,
    hasUseCaseQuests:hasUseCaseQuests,
    countMessages:countMessages
};

