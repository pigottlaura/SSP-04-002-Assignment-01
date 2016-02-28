var express = require('express');
var router = express.Router();

// Requiring the database connection I have set up previously, so that it
// can be shared between routes (i.e. so users can login in the index.js route
// and then query their secrets in the users.js route)
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
    if (req.session.username == null){
        res.cookie("indexTab", 0);
        res.cookie("sortBy", "secretTimePosted");
        res.render('index', {title: "Login", loginWarning: "", createAccountWarning: ""});
    } else {
        res.redirect("/users/secrets");
    }
});

router.get('/createAccount', function (req, res, next) {
    if (req.session.username == null){
        res.cookie("indexTab", 1);
        res.render('index', {title: "Create Account", loginWarning: "", createAccountWarning: ""});
    } else {
        res.redirect("/users/secrets");
    }
});

router.get('/login', function (req, res, next) {
    if (req.session.username == null){
        res.cookie("indexTab", 0);
        res.render('index', {title: "Login", loginWarning: "", createAccountWarning: ""});
    } else {
        res.redirect("/users/secrets");
    }
});

router.post("/logout", function (req, res, next) {
    if (req.session.username != null) {
        req.session.destroy();
        res.cookie("sortBy", "secretTimePosted");
    }
    res.redirect("/");
});

router.post('/createAccount', function (req, res, next) {
    if (req.session.username == null && req.body.username.length > 0 && req.body.password.length > 0) {
        console.log("Attempting to create a new user account");
        connection.query("SELECT * FROM User WHERE username = " + connection.escape(req.body.username), function (err, rows, fields) {
            if (err) {
                console.log("Unable to query database to check if this username exists " + err);
                res.cookie("indexTab", 1);
                res.render("index", {title: "Create Account", loginWarning: "", createAccountWarning: "There was an unexpected err. Please try again." });
            } else if (rows.length == 0) {
                //If no results came back, then this name is available
                connection.query("INSERT INTO User(username, userPassword) VALUES(" + connection.escape(req.body.username) + ", AES_ENCRYPT(" + connection.escape(req.body.password) + ", 'HashMyPassword'))", function (err, rows, fields) {
                    if (err) {
                        console.log("\Unable to add " + req.body.username + " as a new user: " + err);
                    }
                    console.log("New user " + req.body.username + " successfully added");
                    req.session.username = req.body.username;
                    res.cookie("indexTab", 0);
                    res.redirect("/users/secrets");
                });
            } else {
                //This username is already taken
                console.log("Cannot create new user " + req.body.username + ". This username is already taken");
                res.cookie("indexTab", 1);
                res.render("index", {title: "Create Account", loginWarning: "", createAccountWarning: "The username " + req.body.username + " is already taken." });
            }
        });
    } else {
        res.cookie("indexTab", 1);
        res.render("index", {title: "Create Account", loginWarning: "", createAccountWarning: "Please enter a valid username and password." });
    }
});

router.post('/login', function (req, res, next) {
    if (req.body.username != null || req.session.username != null) {
        var currentUsername = req.session.username != null ? req.session.username : req.body.username;
        connection.query("SELECT AES_DECRYPT(userPassword,'HashMyPassword') AS 'userPassword' FROM User WHERE username = " + connection.escape(currentUsername), function (err, rows, fields) {
            if (err) {
                console.log("Unable query the database to see if " + currentUsername + " exists " + err);
                res.cookie("indexTab", 0);
                res.render("index", {title: "Login", loginWarning:"There was an unexpected issue with your login. Please try again.", createAccountWarning: ""});
            } else {
                console.log("Successfully queried the database to see if " + currentUsername + " exists ");
                // Checking if any rows were returned from the query (i.e. does the username
                // exist in our database)
                if (rows.length > 0) {
                    // Checking if this request has a username and password property
                    if (req.body.username != null && req.body.password != null) {
                        // Checking if the password the user entered matched the password we have
                        // stored in the database (no need to check the name, as the query did that
                        // above for us. If the name didn't match, the rows would not have contained
                        // any results)
                        if (req.body.password == rows[0].userPassword) {
                            console.log(req.body.username + " login details match a user in database - Login Authenticated");
                            req.session.username = req.body.username;
                            res.redirect("/users/secrets");
                        } else {
                            console.log("Incorrect password for user " + req.body.username);
                            res.cookie("indexTab", 0);
                            res.render("index", {title: "Login", loginWarning: "Incorrect password for " + req.body.username + ". Please try again.", createAccountWarning: ""});
                        }
                    }
                } else if (req.session.username != null) {
                    console.log(req.body.username + " is already logged in - Login Authenticated");
                    res.redirect("/users/secrets");
                } else {
                    console.log(req.body.username + " is not a registered username");
                    res.cookie("indexTab", 0);
                    res.render("index", {title: "Login", loginWarning: req.body.username + " is not a registered username.", createAccountWarning: ""});
                }
            }
        });
    } else {
    console.log("There is no request username, or session username, to compare to the database");
    res.cookie("indexTab", 0);
    res.render("index", {title: "Login", loginWarning:"There was an unexpected issue with your login. Please try again.", createAccountWarning: ""});
}
});

module.exports = router;
