var express = require('express');
var router = express.Router();
var fs = require("fs");
var mysql = require('mysql');

var storedSecrets;

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
                console.log("\nSuccessfully connected to database with id " + connection.threadId + "\n");
            }
        });
        
        // Querying the database
        connection.query("SELECT u.username AS 'username', s.secretTitle AS 'secretTitle', s.secretDescription AS 'secret' FROM Secret s JOIN User u ON s.secretUserId = u.userId WHERE u.username = 'pigottlaura'", function (err, rows, fields) {
            console.log("Queried all users from the database");
            if (err) {
                console.log("Could not process query. " + err);
            } else {
                console.log("Response recieved from query");
                for (var i = 0; i < rows.length; i++) {
                    console.log(rows[i].username + "'s secret is: " + rows[i].secretTitle + ": " + rows[i].secret);
                }
                console.log("\n");
                storedSecrets = rows;
                res.render('secrets', { username: req.cookies.username, secrets: storedSecrets });
            }
        });
    } else {
        console.log("Already connected to database");
    }
});

router.post('/secrets/modifySecrets', function (req, res, next) {
    console.log(req.body.submit);

    if (req.body.submit == "Delete this Secret") {
        console.log("\n User wants to delete a secret. SecretId = " + req.body.secretId + "\n");
        for (var i = 0; i < storedSecrets.length; i++) {
            if (storedSecrets[i].secretId == req.body.secretId) {
                storedSecrets.splice(i, 1);
            }
        }
    } else if (req.body.submit == "Keep my Secret") {
        console.log("\nNew Secret Recieved: " + req.body.secretTitle + "\n");
        var newSecret = { secretTitle: req.body.secretTitle, secret: req.body.secret, secretId: (new Date).getTime() };
        storedSecrets.push(newSecret);
    }
    /*
    storedSecrets.sort(function (a, b) {
        var answer = 0;
        if (req.cookies.sortByDate == "true") {
            console.log("\nSorting By DATE");
            var numberA = parseInt(a.secretId);
            var numberB = parseInt(b.secretId);
            answer = numberA - numberB;
        } else {
            console.log("\nSorting By TITLE");
            var titleA = a.secretTitle.toLowerCase();
            var titleB = b.secretTitle.toLowerCase();
            if (titleA.secretTitle > titleB.secretTitle) {
                answer = 1;
            } else if (titleA.secretTitle < titleB.secretTitle) {
                answer = -1;
            }
        }
        return answer;
    });
    */

    res.redirect("/users/secrets");
    
    /*
    fs.writeFile(secretsDirectory + "secrets.json", JSON.stringify(storedSecrets), "utf8", function (err) {
        if (err) {
            console.log("\nFailed to save secrets " + err + "\n");
        }
        else {
            console.log("\nSecrets successfully saved :)\n");
        }
        console.log("\nSecrets Reloaded\n");
    });
    */
});

module.exports = router;
