var express = require('express');
var router = express.Router();
var fs = require("fs");
var mysql = require('mysql');

var sortBy;

// Setting up the connection to my local mySql database (running on a WAMP server)
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mySecrets"
});

//connection.end();

/* GET users listing. */

router.get('/secrets', function (req, res, next) {
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
    // Results will be sorted as specified by the user (on the client side)
    sortBy = req.cookies.sortByDate == "true" ? "secretTimePosted" : "secretTitle";
    console.log("Results will be sorted by " + sortBy);
    next();
});

router.get('/secrets', function (req, res, next) {
    // Querying the database
    connection.query("SELECT u.username AS 'username', AES_DECRYPT(s.secretTitle, 'encryptSecretTitle') AS 'secretTitle',  AES_DECRYPT(s.secretDescription, 'encryptSecretDescription') AS 'secret', s.secretId AS 'secretId' FROM Secret s JOIN User u ON s.secretUserId = u.userId WHERE u.username = 'usernameA' ORDER BY s." + sortBy, function (err, rows, fields) {
        console.log("Queried the user's secrets from the database");
        if (err) {
            console.log("Could not process query. " + err);
        } else {
            console.log("Response recieved from query");
            if (rows.length < 1) {
                console.log("No data found to match your query");
            }
            for (var i = 0; i < rows.length; i++) {
                console.log(rows[i].username + "'s secret is: " + rows[i].secretTitle + ": " + rows[i].secret);
            }
            console.log("\n");
            res.render('secrets', { username: req.cookies.username, secrets: rows});
        }
    });
});

router.post('/secrets/modifySecrets', function (req, res, next) {
    console.log(req.body.submit);

    if (req.body.submit == "Delete this Secret") {
        console.log("User wants to delete a secret. SecretId = " + req.body.secretId);
        connection.query("DELETE FROM Secret WHERE secretId = " + connection.escape(req.body.secretId), function(err, rows, fields){
          if(err){
                console.log("\nSecretId " + req.body.secretId + " could not be deleted: " + err + "\n");
            } else {
                console.log("Successfully deleted secretId: " + req.body.secretId);
            } 
        });
    } else if (req.body.submit == "Keep my Secret") {
        var newSecretId =  (new Date).getTime() + "-" + req.session.username;
        console.log("New Secret Recieved: " + newSecretId);
        connection.query("INSERT INTO Secret(secretId, secretTitle, secretDescription, secretUserId) VALUES(" + mysql.escape(newSecretId) + ", AES_ENCRYPT(" + connection.escape(req.body.secretTitle) + ", 'encryptSecretTitle'), AES_ENCRYPT(" + connection.escape(req.body.secret) + ", 'encryptSecretDescription'), 1)", function (err, rows, fields) {
            if(err){
                console.log("\nNew secret could not be saved: " + err + "\n");
            } else {
                console.log("Successfully saved new secret");
            }
        });
    }
    res.redirect("/users/secrets");
});

module.exports = router;
