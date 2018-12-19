'use strict';
const express = require('express');
let bodyParser = require('body-parser');
let app = express();
const winston = require('winston');
const fs = require('fs');
const logDir = 'log';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const tsFormat = () => (new Date()).toLocaleTimeString();
const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      level: 'info'
    }),
    new (require('winston-daily-rotate-file'))({
      filename: `${logDir}/-results.log`,
      timestamp: tsFormat,
      datePattern: 'yyyy-MM-dd',
      prepend: true,
      level: 'info'
})
]
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
let server = require('http').createServer(app);
let mysql = require("mysql");
let port = 2016;

server.listen(port, function () {
    console.log("started successfully : " + ":" + port);
});
let connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'selekt.in',
    database : 'selekt'
});
connection.connect();

app.post("/profile/signup",function(req,res)
{
    if(req.method=='POST')
    {
        let resp_obj =
        {
            "status":false,
            "data" :{},
            "error" : ""
        };
        let state = true;
        let string = "";

        let username = req.body.username;
        let email = req.body.email;
        let mobile_no = req.body.mobile_number;
        let password = req.body.password;
        if(username.length==0)
        {
            state = false;
            string ="Username Empty";
        }
        else if(email.length==0)
        {
            state = false;
            string = "Email Empty";
        }

        if(!state)
        {
            resp_obj.status = false;
            resp_obj.error = string;
            res.send(resp_obj);
        }
        else
        {
            let query = "select * from users where email='"+email+"'";
            get_result(query,function(data)
            {
                console.log(data);
                if(data.length==0)
                {
                    let insert_query = "insert into users(username,email,mobile_number,password) values('"+username+"','"+email+"','"+mobile_no+"','"+password+"')"
                    get_result(insert_query,function(result)
                    {
                        
                        let user_id = result.insertId;
                        let getting_info = "select * from users where user_id='"+user_id+"'";
                        get_result(getting_info,function(result)
                        {
                            resp_obj.status = true;
                            resp_obj.user_id = user_id;
                            resp_obj.username = result[0].username;
                            res.send(resp_obj);
                        });
                        
                    });
                }
                else
                {
                    resp_obj.status= false;
                    resp_obj.error = "Email is already registered."
                    res.send(resp_obj);
                }
            });
        }
    }
});
app.post("/profile/login",function(req,res)
{
    if(req.method=='POST')
    {
        let resp_obj = {status:false,data:{},error:""};
        let query="";
        let source_body = req.body;
        console.log("Source Body : ",source_body);

        let request_type = source_body.request_type;
        if(request_type=="google")
        {
            //google login
            let status = true;
            console.log("Request : Google Login");
            let google_data = source_body.google_data;
            let email = google_data.email
            let google_id = google_data.google_id;
            let username = google_data.username;
            let dob = google_data.dob;
            let profile_pic = google_data.profile_pic;
            if(email==undefined || email=="")
            {
                status = false;
                resp_obj.status = false;
                resp_obj.error = "Email is empty";
                res.send()
            }
            
            if(google_id==undefined || google_id=="")
            {
                status = false;
                resp_obj.status = false;
                resp_obj.error = "Google id is empty";
                res.send(resp_obj)
            }
            
            if(username==undefined || username=="")
            {
                status = false;
                resp_obj.status = false;
                resp_obj.error = "Username is empty";
                res.send(resp_obj)
            }
            
            if(dob==undefined || dob=="")
            {
                status = false;
                resp_obj.status = false;
                resp_obj.error = "Dob is empty";
                res.send(resp_obj);
            }

            if(profile_pic==undefined || profile_pic=="")
            {
                status = false;
                resp_obj.status = false;
                resp_obj.error = "Profile pic is empty";
                res.send(resp_obj);
            }
            
            if(status)
            {
                query = "select * from users where email='"+email+"'";
                get_result(query,function(data)
                {
                    if(data.length>0)
                    {
                        let user_id = data[0].user_id;
                        let google_query = "select * from google_users where user_id='"+user_id+"'";
                        get_result(google_query,function(google_resp)
                        {
                            if(google_resp.length==0)
                            {
                                let insert_google_users = "insert into google_users(user_id,google_id,email,username,dob,profile_pic) values('"+user_id+"','"+google_id+"','"+email+"','"+username+"','"+dob+"','"+profile_pic+"')";
                                get_result(insert_google_users,function(google_insert_resp)
                                {
                                    console.log("New Google User added.");
                                });
                            }
                        });

                        resp_obj = get_obj(data[0]);
                        res.send(resp_obj);
                    }
                    else
                    {
                        let user_insert_query = "insert into users(username,email,dob) values('"+username+"','"+email+"','"+dob+"')";
                        get_result(user_insert_query,function(user_insert_resp)
                        {
                            let user_id = user_insert_resp.insertId;
                            let insert_google_users = "insert into google_users(user_id,google_id,email,username,dob,profile_pic) values('"+user_id+"','"+google_id+"','"+email+"','"+username+"','"+dob+"','"+profile_pic+"')";
                            get_result(insert_google_users,function(google_insert_resp)
                            {
                                console.log("New Google User added.");
                            });
                            get_result("select * from users where user_id='"+user_id+"'",function(response)
                            {
                                resp_obj = get_obj(response[0]);
                                res.send(resp_obj);
                            });
                        });
                    }
                });
            }
        }
        else if(request_type=="fb")
        {
            //facebook login
            console.log("Request : Facebook Login");
            let fb_data = source_body.fb_data;
            let email = fb_data.email;
            let fb_id = fb_data.fb_id;
            let username = fb_data.username;
            let dob = fb_data.dob;
            let profile_pic = fb_data.profile_pic;

            let status = true;

            if(email==undefined || email=="")
            {
                status = false;
                resp_obj.status = false;
                resp_obj.error = "Email is empty";
                res.send()
            }
            
            if(fb_id==undefined || fb_id=="")
            {
                status = false;
                resp_obj.status = false;
                resp_obj.error = "Facebook id is empty";
                res.send(resp_obj)
            }
            
            if(username==undefined || username=="")
            {
                status = false;
                resp_obj.status = false;
                resp_obj.error = "Username is empty";
                res.send(resp_obj)
            }
            
            if(dob==undefined || dob=="")
            {
                status = false;
                resp_obj.status = false;
                resp_obj.error = "Dob is empty";
                res.send(resp_obj);
            }

            if(profile_pic==undefined || profile_pic=="")
            {
                status = false;
                resp_obj.status = false;
                resp_obj.error = "Profile pic is empty";
                res.send(resp_obj);
            }

            if(status)
            {
                query = "select * from users where email='"+email+"'";
                get_result(query,function(data)
                {
                    if(data.length>0)
                    {
                        let facebook_query = "select * from fb_users where user_id='"+data[0].user_id+"'";
                        let user_id = data[0].user_id;
                        get_result(facebook_query,function(fb_resp)
                        {
                            if(fb_resp.length==0)
                            {
                                let insert_facebook_users = "insert into fb_users(user_id,fb_id,email,username,dob,profile_pic) values('"+user_id+"','"+fb_id+"','"+email+"','"+username+"','"+dob+"','"+profile_pic+"')";
                                get_result(insert_facebook_users,function(facebook_insert_resp)
                                {
                                    console.log("New Facebook User added.");
                                });
                            }
                        });

                        resp_obj = get_obj(data[0]);
                        res.send(resp_obj);
                    }
                    else
                    {
                        let user_insert_query = "insert into users(username,email,dob) values('"+username+"','"+email+"','"+dob+"')";
                        get_result(user_insert_query,function(user_insert_resp)
                        {
                            let user_id = user_insert_resp.insertId;
                            let insert_facebook_users = "insert into fb_users(user_id,fb_id,email,username,dob,profile_pic) values('"+user_id+"','"+fb_id+"','"+email+"','"+username+"','"+dob+"','"+profile_pic+"')";
                            get_result(insert_facebook_users,function(facebook_insert_resp)
                            {
                                console.log("New Facebook User added.");
                            });
                            get_result("select * from users where user_id='"+user_id+"'",function(response)
                            {
                                resp_obj = get_obj(response[0]);
                                res.send(resp_obj);
                            });
                        });
                    }
                });
            }
        }
        else if(request_type=="manual")
        {
            console.log("Request : Manual Login");
            let manual_data = source_body.manual_data;
            let email = manual_data.email;
            let password = manual_data.password;
            
            query = "select * from users where email='"+email+"' and password='"+password+"'";
            get_result(query,function(result)
            {
                if(result.length>0)
                {
                    let require_res = result[0];
                    resp_obj = get_obj(require_res);
                    res.send(resp_obj);
                }
                else
                {
                    resp_obj.status = false;
                    resp_obj.error = "Invalid Credentials";
                    res.send(resp_obj);
                }
            });
        }
    }
});
app.post('/profile/update',function(req,res)
{
    let body = req.body;
    console.log("In Update function : ",body);
    let resp_obj = {status:true, error:"",data:{}};
    let status = true;

    let user_id = body.user_id;
    if(user_id==undefined || user_id=="")
    {
        status= false;
        resp_obj.status = false;
        resp_obj.error = "user id empty";
        res.send(resp_obj);
    }
    let body_shape = body.body_shape;
    if(body_shape==undefined || body_shape=="")
    {
        status = false;
        resp_obj.status = false;
        resp_obj.error = "body shape empty";
        res.send(resp_obj);
    }
    let dob = body.dob;
    if(dob==undefined || dob=="")
    {
        status = false;
        resp_obj.status = false;
        resp_obj.error = "date of birth empty";
        res.send(resp_obj);
    }
    let bust_size = body.bust_size;
    if(bust_size==undefined || bust_size=="")
    {
        status= false;
        resp_obj.status = false;
        resp_obj.error = "bust size empty";
        res.send(resp_obj);
    }
    let hip_size = body.hip_size;
    if(hip_size==undefined || hip_size=="")
    {
        status = false;
        resp_obj.status = false;
        resp_obj.error = "Hip Size empty";
        res.send(resp_obj);
    }
    let waist_size = body.waist_size;
    if(waist_size==undefined || waist_size=="")
    {
        status = false;
        resp_obj.status = false;
        resp_obj.error = "Waise Size empty";
        res.send(resp_obj);
    }
    let footwear = body.footwear;
    if(footwear==undefined || footwear=="")
    {
        status = false;
        resp_obj.status = false;
        resp_obj.error = "Footwear empty";
        res.send(resp_obj);
    }
    let height = body.height;
    if(height==undefined || height=="")
    {
        status = false;
        resp_obj.status = false;
        resp_obj.error = "Height empty";
        res.send(resp_obj);
    }
    let skin_colour = body.skin_colour;
    if(skin_colour==undefined || skin_colour=="")
    {
        status = false;
        resp_obj.status = false;
        resp_obj.error = "Skin Colour empty";
        res.send(resp_obj);
    }
    if(status)
    {
        let query = "update users set skin_colour='"+skin_colour+"', height='"+height+"', bust_size='"+bust_size+"', hip_size='"+hip_size
        +"',waist_size='"+waist_size+"', footwear='"+bust_size+"', body_shape='"+body_shape
        +"', dob='"+dob+"' where user_id='"+user_id+"'";
        get_result(query,function(result)
        {
            resp_obj.status = true;
            resp_obj.data = {"message":"updated successfully"};
            resp_obj.error = "";
            res.send(resp_obj);
        });
    }
});
app.post('/profile/events',function(req,res)
{
    let message = JSON.stringify(req.body);
    logger.info(message);
    res.send("ok");
});

function get_result(query,callback)
{
    connection.query(query,function(error,result)
        {
            if(error) console.error(error);
            else
            {
                callback(result);
            }
        });
}

function get_obj(require_res)
{
    let resp_obj = {data:{}};
    resp_obj.status = true;
    resp_obj.data.user_id = require_res["user_id"];
    resp_obj.data.username = require_res["username"];
    resp_obj.data.age = require_res["age"];
    resp_obj.data.dob = require_res["dob"];
    resp_obj.data.body_shape = require_res["body_shape"];
    resp_obj.data.bust_size = require_res["bust_size"];
    resp_obj.data.hip_size = require_res["hip_size"];
    resp_obj.data.waist_size = require_res["waist_size"];
    resp_obj.data.footwear = require_res["footwear"];
    resp_obj.data.height = require_res["height"];
    resp_obj.data.skin_colour = require_res["skin_colour"];
    resp_obj.error = "";

    return resp_obj;
}