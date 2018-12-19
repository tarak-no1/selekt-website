var mysql = require("mysql");

function checkUserId(details, dbName, callback) {
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ginger@data",
    database: 'prodx'
  });

  con.connect(function (err) {
    if (err) {
      console.log('Error connecting to Db');
      return;
    }
  });

  con.query("SELECT * FROM chatapp_user WHERE name = ?", details["username"], function (err, res) {
    if (err) throw err;
    if (res.length == 0) {
      callback(true);
    }
  });
}

function inserttodB(details, dbName) {
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ginger@data",
    database: 'prodx'
  });

  con.connect(function (err) {
    if (err) {
      console.log('Error connecting to Db');
      return;
    }
  });

  con.query("SELECT * FROM chatapp_user WHERE name = ?", [details["username"]], function (err, res) {
    if (err) throw err;
    if (res.length == 0) {
      con.query('INSERT INTO chatapp_user  SET  ?', { name: details["username"] }, function (err, res) {
        if (err) throw err;
        // console.log("inserted into chatapp_user: ",res.length , res);
      });
    }

    con.query('INSERT INTO chatapp_msg  SET ?', details, function (err, res) {
      if (err) throw err;

      // console.log("inserted into chatapp_msg: ",res.length , res);
      con.end();
    });
  });

  /*con.end(function(err) {
    // The connection is terminated gracefully
    // Ensures all previously enqueued queries are still
    // before sending a COM_QUIT packet to the MySQL server.
  });*/
}
module.exports = {
  inserttodB: inserttodB
};

//# sourceMappingURL=pushintodb-compiled.js.map