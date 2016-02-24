var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = require("../database/connection");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Secrets' });
});

router.get('/createAccount', function (req, res, next) {
    if (req.session.id == null) {
        console.log("\nnew user\n");
    } else {
        console.log("\nlogged in user\n");
    }
});

router.post('/login', function (req, res, next) {
    connection.query("SELECT * FROM User", function (err, rows, fields) {
        if (rows.length > 0) {
            req.session.username = req.body.username;
            res.cookie("sortByDate", "true");
            res.redirect("/users/secrets");
        } else {
            next();
        }
    });
});

router.post('/login', function (req, res, next) {
    var err = new Error('Wrong Username or Password');
    err.status = 401;
    res.render("loginError", { message: "Wrong Username or Password", error: err });
});

module.exports = router;
