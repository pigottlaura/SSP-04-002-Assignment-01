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
        connection.query("SELECT * FROM User WHERE username = " + req.body.username, function (err, rows, fields) {
            if (rows === undefined) {
                //If no results came back, then this name is available
                connection.query("INSERT INTO User(username, userPassword) VALUES(" + connection.escape(req.body.username) + "," + connection.escape(req.body.password) + ")", function (err, rows, fields) {
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
    if (req.session.username != null || req.body.username != null) {
        connection.query("SELECT * FROM User", function (err, rows, fields) {
            if (rows.length > 0) {
                req.session.username = req.body.username;
                res.cookie("sortByDate", "true");
                res.redirect("/users/secrets");
            } else {
                next();
            }
        });
    }
});

router.post('/login', function (req, res, next) {
    var err = new Error('Wrong Username or Password');
    err.status = 401;
    res.render("loginError", { message: "Wrong Username or Password", error: err });
});

router.post("/logout", function(req, res, next){
    if(req.session.username != null){
        req.session.destroy();
    }
    res.redirect("/");
});

module.exports = router;
