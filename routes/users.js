var express = require('express');
var router = express.Router();
var fs = require("fs");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function(req, res, next){
  if(req.body.username == "Laura" && req.body.password == "password"){
    res.redirect("/users/secrets");
  } else{
    next();
  }
});

router.post('/login', function(req, res, next){
  var err = new Error('Wrong Username or Password');
  err.status = 401;
  res.render("loginError", {message:"Wrong Username or Password", error: err});
});

router.get('/secrets', function (req, res, next){
  var storedSecrets = JSON.parse(fs.readFileSync("bin/secrets.json", "utf8"));
  console.log(storedSecrets);
  res.render('secrets', { username: req.body.username, secrets: storedSecrets});
});

router.post('/secrets', function (req, res, next){
  res.render('secrets', { username: req.body.username});
});

module.exports = router;
