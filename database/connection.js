var mysql = require('mysql');

// Creating a connection string varaible, which will allow me to access my local
// database when running my app locally (for testing purposes) or my remote
// MySQL database on Azure, when my application has been deployed live to Azure
var connectionString = process.env.MYSQLCONNSTR_mySecrets || "mysql://root:@localhost/mySecrets";

// Setting up the connection to my MySQL database (running on a WAMP server locally,
// or live on Azure, depending on where my application is being run from)
var connection = mysql.createConnection(connectionString);

// Checking if we are already connected to the server
if (connection.threadId == null) {
    // Connecting to the database
    connection.connect(function (err) {
        if (err) {
            console.error("\nCould not connect to server " + err.stack + "\n");
        } else {
            console.log("Successfully connected to database");
        }
    });
} else {
    console.log("Already connected to database");
}

//connection.end();

module.exports = connection;