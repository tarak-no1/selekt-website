var attributeList = ["RAM","processor","gpu","os","dual sim"];
var attributeValueList = ["snapdragon","android","auto HDR","micro sim","gyroscope","fingerprint"];
var featureList = ["camera","video","display","battery"];


function knowledgePointers(){

    var pointerList = ["what is <<attribute>>",
        "Tell me about <<aval>>",
        "How good is <<aval>>",
        "what are the cons of <<aval>> ?",
        "what are the pros of <<aval>> ?"];

    for(var i=0;i<pointerList.length;i++) {
        var rand;
        if(pointerList[i].indexOf("<<attribute>>") > -1) {
            rand = Math.floor(Math.random() * attributeList.length);
            pointerList[i] = pointerList[i].replace("<<attribute>>", attributeList[rand]);
        }
        if(pointerList[i].indexOf("<<aval>>") > -1) {
            rand = Math.floor(Math.random() * attributeValueList.length);
            pointerList[i] = pointerList[i].replace("<<aval>>", attributeValueList[rand]);
        }
    }
    pointerList = squash(pointerList);
    console.log(pointerList);
}

function recommendationQues(){
    
}

function compareFunctionPointers(sku1,sku2){

    var pointerList = ["Give me the highlights of <<sku1>>",
        "Give me the highlights of <<sku2>>",
        "Pros of <<sku>>",
        "Pros of <<sku2>>",
        "What is the RAM of <<sku>>",
        "compare camera features of <<sku>> and <<sku2>>",
        "Expert reviews of <<sku>>",
        "how good is the camera of <<sku2>>"];
    for(var i=0;i<pointerList.length;i++) {
        var rand;
        if(pointerList[i].indexOf("<<sku1>>") > -1) {
            pointerList[i] = pointerList[i].replace("<<sku1>>", sku1);
        }

        if(pointerList[i].indexOf("<<sku2>>") > -1) {
            pointerList[i] = pointerList[i].replace("<<sku2>>", sku2);
        }
    }
    pointerList = squash(pointerList);
    console.log(pointerList);
}

function attributeValueFunctionPointers(sku){

    var pointerList = ["what is <<attribute>> of <<sku>>",
        "Give me highlights of <<sku>>",
        "what's the  <<attribute>> of <<sku>> ?",
        "what are the pros of <<sku>> ?",
        "what are the <<feature>> specs of <<sku>>",
        "compare <<sku>> with galaxy s5",
        "compare <<feature>> specs of <<sku>> and oneplus one"];

    for(var i=0;i<pointerList.length;i++) {
        var rand;
        if(pointerList[i].indexOf("<<attribute>>") > -1) {
            rand = Math.floor(Math.random() * attributeList.length);
            pointerList[i] = pointerList[i].replace("<<attribute>>", attributeList[rand]);
        }

        if(pointerList[i].indexOf("<<feature>>") > -1) {
            rand = Math.floor(Math.random() * featureList.length);
            pointerList[i] = pointerList[i].replace("<<feature>>", featureList[rand]);
        }

        if(pointerList[i].indexOf("<<sku>>") > -1) {
            pointerList[i] = pointerList[i].replace("<<sku>>", sku);
        }
    }

    pointerList = squash(pointerList);
    console.log(pointerList);

}
function specsOfSKUFunctionPointers(sku){

    var pointerList = ["Give me models with better <<sku>>",
        "Give me the highlights of <<sku>>",
        "Give me pros of <<sku>>",
        "What is the <<attribute>> of <<sku>>",
        "compare <<feature>> specs of <<sku>> and oneplus one",
        "Expert reviews of <<sku>>",
        "How good is <<aval>>? ",
        "compare <<sku>> with Moto g3"];

    for(var i=0;i<pointerList.length;i++) {
        var rand;
        if(pointerList[i].indexOf("<<attribute>>") > -1) {
            rand = Math.floor(Math.random() * attributeList.length);
            pointerList[i] = pointerList[i].replace("<<attribute>>", attributeList[rand]);
        }

        if(pointerList[i].indexOf("<<feature>>") > -1) {
            rand = Math.floor(Math.random() * featureList.length);
            pointerList[i] = pointerList[i].replace("<<feature>>", featureList[rand]);
        }
        if(pointerList[i].indexOf("<<aval>>") > -1) {
            rand = Math.floor(Math.random() * attributeValueList.length);
            pointerList[i] = pointerList[i].replace("<<aval>>", attributeValueList[rand]);
        }

        if(pointerList[i].indexOf("<<sku>>") > -1) {
            pointerList[i] = pointerList[i].replace("<<sku>>", sku);
        }
    }

    pointerList = squash(pointerList);
    console.log(pointerList);

}

function makePointers(pointerList,sku,sku2){
    for(var i=0;i<pointerList.length;i++) {
        var rand;
        if(pointerList[i].indexOf("<<attribute>>") > -1) {
            rand = Math.floor(Math.random() * attributeList.length);
            pointerList[i] = pointerList[i].replace("<<attribute>>", attributeList[rand]);
        }

        if(pointerList[i].indexOf("<<aval>>") > -1) {
            rand = Math.floor(Math.random() * attributeValueList.length);
            pointerList[i] = pointerList[i].replace("<<aval>>", attributeValueList[rand]);
        }

        if(pointerList[i].indexOf("<<feature>>") > -1) {
            rand = Math.floor(Math.random() * featureList.length);
            pointerList[i] = pointerList[i].replace("<<feature>>", featureList[rand]);
        }

        if(pointerList[i].indexOf("<<sku>>") > -1) {
            pointerList[i] = pointerList[i].replace("<<sku>>", sku);
        }

        if(pointerList[i].indexOf("<<sku2>>") > -1) {
            pointerList[i] = pointerList[i].replace("<<sku2>>", sku2);
        }
    }

    pointerList = squash(pointerList);
    console.log(pointerList);
    return pointerList;
}
function squash(arr) {
    var tmp = [];
    for (var i = 0; i < arr.length; i++) {
        if (tmp.indexOf(arr[i]) == -1) {
            tmp.push(arr[i]);
        }
    }
    return tmp;
}
//knowledgePointers();
//compareFunctionPointers("galaxy s7","oneplus one");
attributeValueFunctionPointers("galaxy s7");
