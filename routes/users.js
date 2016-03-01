// Requiring the express module, so that I can use it to generate the router
var express = require('express');

// Creating a new router object using the Router method of express object
var router = express.Router();

// Requiring the database connection I have set up previously, so that it
// can be shared between routes (i.e. so users can login in the index.js route
// and then query their secrets in the users.js route)
var connection = require("../database/connection");

// All requests to get the secrets will be handled by this router
router.get('/secrets', function (req, res, next) {
    
    // Results will be sorted as specified by the user (on the client side). This value
    // will be passed into the ORDER BY portion of the SQL query everytime results are requested
    // from the database
    var sortBy = req.cookies.sortBy == "secretTitle" ? " CONVERT(AES_DECRYPT(s.secretTitle, " + connection.escape(process.env.SecretTitleKey) + "), CHAR)" : "secretTimePosted";
    console.log("Results will be sorted by " + req.cookies.sortBy);
     
    // Querying the database. Looking for the username, decrypted secretTitle and the decrypted secretDescription
    // based on checking if the username of the user that is currently logged in (using express-session) is the
    // one who created any of the secrets in the database. Using the escape() method of the connection object to add
    // "" around the value of the user submitted data (as requested by the API of the mysql module).
    // The password column was encrypted so that even if the database were to be comprimised, this data would be secured.
    // Accessing the encryption keys for each column from environment variable I have set up locally and on Azure,
    // so as to ensure that the data cannot be comprimised.
    connection.query("SELECT u.username AS 'username', AES_DECRYPT(s.secretTitle, " + connection.escape(process.env.SecretTitleKey) + ") AS 'secretTitle',  AES_DECRYPT(s.secretDescription, " + connection.escape(process.env.SecretDesKey) + ") AS 'secret', s.secretId AS 'secretId' FROM Secret s JOIN User u ON s.secretUserId = u.userId WHERE u.username = " + connection.escape(req.session.username) + " ORDER BY " + sortBy, function (err, rows, fields) {
        
        // Checking if there were any errors with this query
        if (err) {
            console.log("Could not process query. " + err);
        } else {
            console.log("Response recieved from query");
            
            // If no rows are returned, then there were no results from the query, so this user has
            // no secrets currently stored in the database
            if (rows.length == 0) {
                console.log("This user has no secrets");
            } else {
                // Since there were rows returned from the query, this user has secrets saved in the database.
                // Looping through all of the rows that were returned, and logging their details out to the console
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

// All requests to delete secrets will be handled by this router
router.post('/secrets/deleteSecret', function (req, res, next) {
    console.log("User wants to delete a secret. SecretId = " + req.body.secretId);
    
    // Deleting any rows from the database that have a secretId which match the value of the
    // secret id passed into the request body. (Note - as secretId is the primary key of the
    // Secret table, this query could only ever possibly delete one secret. Using the escape() 
    // method of the connection object to add "" around the value of the user submitted data 
    // (as requested by the API of the mysql module).
    connection.query("DELETE FROM Secret WHERE secretId = " + connection.escape(req.body.secretId), function (err, rows, fields) {
        
        // Checking if there were any error with this query
        if (err) {
            console.log("\nSecretId " + req.body.secretId + " could not be deleted: " + err + "\n");
        } else {
            console.log("Successfully deleted secretId: " + req.body.secretId);
        }
    });
    
    // Redirecting the user back to the /user/secrets page so that their secrets can be regenerated,
    // so that any secrets that were deleted will be removed from the client side aswell
    res.redirect("/users/secrets");
});

// All requests to add new secrets will be handled by this router
router.post('/secrets/addNewSecret', function (req, res, next) {
    
    // Generating a new unique id for this secret by concatenating the current epoch time, to the username
    // of the user, so that no two secrets can have the same id
    var newSecretId = (new Date).getTime() + "-" + req.session.username;
    console.log("New Secret Recieved: " + newSecretId);
    
    
    // Inserting a new row into the database, to generate a new secret in the Secret table. Using the escape() 
    // method of the connection object to add "" around the value of the user submitted data (as requested by 
    // the API of the mysql module). The secretTitle and secretDescription columns will be encrypted so that
    // even if the database were to be comprimised, this data would be secured. Accessing the encryption keys 
    // for each column from environment variable I have set up locally and on Azure, so as to ensure that the 
    // data cannot be comprimised.
    connection.query("INSERT INTO Secret(secretId, secretTitle, secretDescription, secretUserId) VALUES(" + connection.escape(newSecretId) + ", AES_ENCRYPT(" + connection.escape(req.body.secretTitle) + ", " + connection.escape(process.env.SecretTitleKey) + "), AES_ENCRYPT(" + connection.escape(req.body.secret) + ", " + connection.escape(process.env.SecretDesKey) + "), (SELECT userId FROM User WHERE username = " + connection.escape(req.session.username) + "))", function (err, rows, fields) {
        
        // Checking if there were any errors with this query
        if (err) {
            console.log("\nNew secret could not be saved: " + err + "\n");
        } else {
            console.log("Successfully saved new secret");
        }
    });
    
    // Redirecting the user back to the /user/secrets page so that their secrets can be regenerated,
    // so that any secrets that were added will be added to the client side aswell
    res.redirect("/users/secrets");
})

// All requests to edit secrets will be handled by this router
router.post('/secrets/updateSecret', function (req, res, next) {
    console.log("Updating secret " + req.body.secretId);
    
    // Using the escape() method of the connection object to add
    // "" around the value of the user submitted data (as requested by the API of the mysql module).
    // Encrypting the value of the secretDescription column, so that even if the database were to be comprimised,
    // this data would be secured. Accessing the encryption keys for each column from environment variable I 
    // have set up locally and on Azure, so as to ensure that the data cannot be comprimised.
    connection.query("UPDATE Secret SET secretDescription = AES_ENCRYPT(" + connection.escape(req.body.newSecretText) + ", " + connection.escape(process.env.SecretDesKey) + ") WHERE secretId = " + connection.escape(req.body.secretId), function (err, rows, fields) {
        
        // Checking if there was any error with the query
        if (err) {
            console.log(req.body.secretId + " could not be updated: " + err + "\n");
        } else {
            console.log("Successfully updated secret " + req.body.secretId);
        }
    });
    
    // Redirecting the user back to the /user/secrets page so that their secrets can be regenerated,
    // so that any secrets that were edited will be updated on the client side aswell
    res.redirect("/users/secrets");
});

// Sending the router variable as an export of this module so that I can
// require and access it in the main app, so it can be specified as a route
// for a particular path i.e this module will be used for all requests to "/"
module.exports = router;
