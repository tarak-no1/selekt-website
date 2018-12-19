/**
 * Created by TARUN on 25-May-16.
 */
'use strict';


const sessions = {};

const findOrCreateSession = function(fbid)  {

    let sessionId;
    // Let's see if we already have a session for the user fbid
    Object.keys(sessions).forEach(function (k) {
        if (sessions[k].fbid === fbid) {
            // Yep, got it!
            sessionId = k;
        }
    });
    if (!sessionId) {

        console.log("session created");
        // No session found for user fbid, let's create a new one
        sessionId = new Date().toISOString();
        sessions[sessionId] = {
            fbid: fbid,
            context: {
            }
        }; // set context, _fid_
    }
    return sessionId;
};

const findFBid = function(sessionId){

    if( sessions[sessionId] == undefined ) return sessionId;

    return sessions[sessionId].fbid;
};
const clearContext = function(sessionId)
{
    sessions[sessionId].context = {
        user_profile : {},
        answers : [],
        benefits : [],
        extra_benefits:[],
        web_benefits:[],
        filters : [],
        remove_tags:[],
        from:0,
        event_state:false,
        is_flow_complete:false
    };
    return sessions[sessionId].context;
};
const getContext = function(sessionId){
    return sessions[sessionId].context;
};
const storeContext = function(sessionId,context){
    sessions[sessionId]["context"] = context;
};

const CreateSessionAndroid = function(sessionId,deviceId)  {

    console.log("session created");
    sessions[sessionId] = {
        sessionId: sessionId,
        deviceId : deviceId,
        context: {
            user_profile : {},
            answers : [],
            benefits : [],
            extra_benefits:[],
            web_benefits:[],
            filters : [],
            remove_tags:[],
            from:0,
            event_state : false,
            is_flow_complete:false
        }
    };
};

const isAndroidSessionExists = function(checkSessionId){

    let sessionId;
    Object.keys(sessions).forEach(function (k) {
        if (sessions[k].sessionId === checkSessionId) {
            // Yep, got it!
            sessionId = k;
        }
    });

    if(sessionId) return true;
    return false
};

module.exports = {
    findOrCreateSession:findOrCreateSession,
    findFBid:findFBid,
    getContext : getContext,
    storeContext : storeContext,
    CreateSessionAndroid:CreateSessionAndroid,
    isAndroidSessionExists:isAndroidSessionExists,
    clearContext:clearContext
};