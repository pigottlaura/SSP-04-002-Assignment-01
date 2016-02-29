var express = require('express');
var router = express.Router();

// Requiring the database connection I have set up previously, so that it
// can be shared between routes (i.e. so users can login in the index.js route
// and then query their secrets in the users.js route)
var connection = require("../database/connection");

/* GET users listing. */

router.get('/secrets', function (req, res, next) {
    // Checking if we are already connected to the server, if we haven't then we will
    // do it now. Note - the server was originally setup in the connection.js file in the 
    // database folder of the app
    if (connection.threadId == null) {
        // Connecting to the database
        connection.connect(function (err) {
            if (err) {
                console.error("\nCould not connect to database " + err.stack + "\n");
            } else {
                console.log("Successfully connected to database");
            }
        });
    } else {
        console.log("Already connected to database");
    }
    
    // Results will be sorted as specified by the user (on the client side). This value
    // will be passed into the ORDER BY portion of the SQL query everytime results are requested
    // from the database (i.e. in the next piece of middleware)
    console.log("Results will be sorted by " + req.cookies.sortBy);
    
    // Passing the request on to the next middleware, so that the database can be queried
    // and the page generated
    next();
});

router.get('/secrets', function (req, res, next) {
    
    var sortBy = req.cookies.sortBy == "secretTitle" ? " CONVERT(AES_DECRYPT(s.secretTitle, 'encryptSecretTitle'), CHAR)" : "secretTimePosted";
    // Querying the database. Looking for the username, decrypted secretTitle and the decrypted secretDescription
    // based on checking if the username of the user that is currently logged in (using express-session) is the
    // one who created any of the secrets in the database
    connection.query("SELECT u.username AS 'username', AES_DECRYPT(s.secretTitle, 'encryptSecretTitle') AS 'secretTitle',  AES_DECRYPT(s.secretDescription, 'encryptSecretDescription') AS 'secret', s.secretId AS 'secretId' FROM Secret s JOIN User u ON s.secretUserId = u.userId WHERE u.username = " + connection.escape(req.session.username) + " ORDER BY " + sortBy, function (err, rows, fields) {
        // Add in "COLLATE latin1_general_ci" to end of query, to force to sort case-insensitive.
        // Can't use currently, as it stops the date order from being sortable
        console.log("Queried " + req.session.username + "'s secrets from the database");
        if (err) {
            console.log("Could not process query. " + err);
        } else {
            console.log("Response recieved from query");
            
            // If no rows are returned, then there were no results from the query
            if (rows.length < 1) {
                console.log("No data found to match your query");
            } else {
                // Loop through all of the rows that were returned, and log their details
                // out to the console
                for (var i = 0; i < rows.length; i++) {
                    console.log(rows[i].username + "'s secret is: " + rows[i].secretTitle + ": " + rows[i].secret);
                }
                // Adding a new line after all the rows have been logged out
                console.log("\n");
            }  
            
            // Rendering the secrets view, using the username of the current user, and passing in the 
            // secrets of theirs which we just retrieved from the database (if any)
            res.render('secrets', {title: "My Secrets", username: req.session.username, secrets: rows});
        }
    });
});


router.post('/secrets/deleteSecret', function (req, res, next) {
    console.log("User wants to delete a secret. SecretId = " + req.body.secretId);
    connection.query("DELETE FROM Secret WHERE secretId = " + connection.escape(req.body.secretId), function (err, rows, fields) {
        if (err) {
            console.log("\nSecretId " + req.body.secretId + " could not be deleted: " + err + "\n");
        } else {
            console.log("Successfully deleted secretId: " + req.body.secretId);
        }
    });
    res.redirect("/users/secrets");
});

router.post('/secrets/addNewSecret', function (req, res, next) {
    var newSecretId = (new Date).getTime() + "-" + req.session.username;
    console.log("New Secret Recieved: " + newSecretId);
    connection.query("INSERT INTO Secret(secretId, secretTitle, secretDescription, secretUserId) VALUES(" + connection.escape(newSecretId) + ", AES_ENCRYPT(" + connection.escape(req.body.secretTitle) + ", 'encryptSecretTitle'), AES_ENCRYPT(" + connection.escape(req.body.secret) + ", 'encryptSecretDescription'), (SELECT userId FROM User WHERE username = " + connection.escape(req.session.username) + "))", function (err, rows, fields) {
        if (err) {
            console.log("\nNew secret could not be saved: " + err + "\n");
        } else {
            console.log("Successfully saved new secret");
        }
    });
    res.redirect("/users/secrets");
})

router.post('/secrets/updateSecret', function (req, res, next) {
    console.log("Updating secret " + req.body.secretId);
    connection.query("UPDATE Secret SET secretDescription = AES_ENCRYPT(" + connection.escape(req.body.newSecretText) + ", 'encryptSecretDescription') WHERE secretId = " + connection.escape(req.body.secretId), function (err, rows, fields) {
        if (err) {
            console.log(req.body.secretId + " could not be updated: " + err + "\n");
        } else {
            console.log("Successfully updated secret " + req.body.secretId);
        }
    });
    res.redirect("/users/secrets");
});

module.exports = router;
