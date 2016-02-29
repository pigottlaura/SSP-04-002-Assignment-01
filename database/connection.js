// Requiring the mysql module, so that I can use it to set up a connection to
// my SQL database
var mysql = require('mysql');

// Creating a connection string varaible, which will allow me to access my local
// database when running my app locally (for testing purposes) or my remote
// MySQL database on Azure, when my application has been deployed live to Azure
// using a connection string that has been defined as an environment variable in
// my Azure web app's application settings
var connectionString = process.env.MYSQLCONNSTR_mySecrets || "mysql://root:@localhost/mySecrets";

// Logging out the value of the connection string. Bug testing to ensure that the
// correct connection string is being picked up based on which environment I am in
// i.e. local or remote
console.log(connectionString);

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

// Sending the connection variable as an export of this module so that I can
// require and access it in multiple routes of this application
module.exports = connection;