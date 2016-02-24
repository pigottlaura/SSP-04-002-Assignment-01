var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = require("../database/connection");

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

/* GET home page. */

router.get('/', function (req, res, next) {
    res.render('index', { title: 'Secrets' });
});

router.get('/createAccount', function (req, res, next) {
    if (req.session.username == null) {
        console.log("This is a new user");
        res.render("createAccount", false);
    } else {
        console.log("This is a logged in user");
        res.redirect("/");
    }
});

router.post('/createAccount', function (req, res, next) {
    if (req.session.username == null && req.body.username != null) {
        console.log("Attempting to create a new user account");
        connection.query("SELECT * FROM User WHERE username = " + req.body.username, function (err, rows, fields) {
            if (rows === undefined) {
                //If no results came back, then this name is available
                connection.query("INSERT INTO User(username, userPassword) VALUES(" + connection.escape(req.body.username) + ", " + connection.escape(req.body.password) + ")", function (err, rows, fields) {
                    if (err) {
                        console.log("\Unable to add " + req.body.username + " as a new user: " + err);
                    }
                    console.log("New user " + req.body.username + " successfully added");
                    req.session.username = req.body.username;
                    res.cookie("sortByDate", "true");
                    res.redirect("/users/secrets");
                });
            } else {
                //This username is already taken
                console.log("Cannot create new user " + req.body.username + ". This username is already taken");
                res.render("createAccount", { warning: "This username is already taken." });
            }
        });
    } else {
        res.redirect("/");
    }
});

router.post('/login', function (req, res, next) {
    if (req.body.username != null || req.session.username != null) {
        var currentUsername = req.session.username != null ? req.session.username : req.body.username;
        connection.query("SELECT userPassword FROM User WHERE username = " + mysql.escape(currentUsername), function (err, rows, fields) {
            var authenticatedLogin = false;
            
            // Checking if any rows were returned from the query (i.e. does the username
            // exist in our database)
            if (rows !== undefined && rows.length > 0) {
                // Checking if this request has a username and password property
                if (req.body.username != null && req.body.password != null) {
                    // Checking if the password the user entered matched the password we have
                    // stored in the database (no need to check the name, as the query did that
                    // above for us. If the name didn't match, the rows would not have contained
                    // any results)
                    if (req.body.password == rows[0].userPassword) {
                        console.log(req.body.username + " login details match a user in database - Login Authenticated");
                        authenticatedLogin = true;
                        req.session.username = req.body.username;
                        res.cookie("sortByDate", "true");
                        authenticatedLogin = true;
                    } else {
                        console.log("Incorrect password for user " + req.body.username);
                    }
                } else if (req.session.username != null) {
                    console.log(req.body.username + " is already logged in - Login Authenticated");
                    authenticatedLogin = true;
                }
            }
            if(authenticatedLogin){
                res.redirect("/users/secrets");
            } else {
                console.log(req.body.username + " is not a registered username");
                next();
            }
        });
    } else {
        console.log("There is no request username, or session username, to compare to the database");
        next();
    }
});

router.post('/login', function (req, res, next) {
    var err = new Error('Wrong Username or Password');
    err.status = 401;
    res.render("loginError", { message: "Wrong Username or Password", error: err });
});

router.post("/logout", function (req, res, next) {
    if (req.session.username != null) {
        req.session.destroy();
    }
    res.redirect("/");
});

module.exports = router;
