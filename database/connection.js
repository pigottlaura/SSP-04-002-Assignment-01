var mysql = require('mysql');

// Creating a connection string varaible, which will allow me to access my local
// database when running my app locally (for testing purposes) or my remote
// MySQL database on Azure, when my application has been deployed live to Azure
var connectionString = process.env.CUSTOMCONNSTR_MySecrets || "mySecrets://localhost/";

// Setting up the connection to my MySQL database (running on a WAMP server locally,
// or live on Azure, depending on where my application is being run from)
if (connectionString == "mySecrets://localhost/") {
    var connection = mysql.createConnection({
        host: "localHost",
        user: "root",
        password: "",
        database: "mySecrets"
    });
} else {
    var connection = mysql.createConnection(connectionString);
}

//connection.end();

module.exports = connection;