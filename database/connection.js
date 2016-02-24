var mysql = require('mysql');

// Setting up the connection to my local mySql database (running on a WAMP server)
var connection = mysql.createConnection({
    host: "localHost",
    user: "root",
    password: "",
    database: "mySecrets"
});

//connection.end();

module.exports = connection;