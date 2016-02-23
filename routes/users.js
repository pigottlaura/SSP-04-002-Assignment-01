var express = require('express');
var router = express.Router();
var fs = require("fs");
var storedSecrets;
var secretsDirectory = "./";

/* GET users listing. */

router.get('/createAccount', function(req, res, next){
    if(req.session.id == null){
        console.log("\nnew user\n");
    } else {
        console.log("\nlogged in user\n");
    }
});

router.post('/login', function(req, res, next){
    if(req.body.username == "Laura" && req.body.password == "password"){
        req.session.username = req.body.username;
        //res.cookie("loggedIn", "true");
        //res.cookie("sortByDate", "true");
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
  console.log(req.session.id);
  if(req.session.username != null){
    try {
      storedSecrets = JSON.parse(fs.readFileSync("./secrets.json", "utf8"));
    } catch(error){
      console.log("You are in development mode");
      secretsDirectory = "./bin/";
      storedSecrets = JSON.parse(fs.readFileSync("./bin/secrets.json", "utf8"));
    }
    res.render('secrets', {username: req.cookies.username, secrets: storedSecrets});
  } else {
    console.log("\nThis user is not yet logged in. Returning them to the home page.\n");
    res.redirect("/");
  }
});

router.post('/secrets/modifySecrets', function (req, res, next){
  console.log(req.body.submit);
  if(req.body.submit == "Delete this Secret"){
    console.log("\n User wants to delete a secret. SecretId = " + req.body.secretId + "\n");
    for(var i = 0; i < storedSecrets.length; i++){
      if(storedSecrets[i].secretId == req.body.secretId){
        storedSecrets.splice(i, 1);
      }
    }
  } else if (req.body.submit == "Keep my Secret"){
    console.log("\nNew Secret Recieved: " + req.body.secretTitle + "\n");
    var newSecret = {secretTitle: req.body.secretTitle, secret: req.body.secret, secretId: (new Date).getTime()};
    storedSecrets.push(newSecret);
  }
  storedSecrets.sort(function(a, b){
    var answer = 0;
    if(req.cookies.sortByDate == "true"){
      console.log("\nSorting By DATE");
      var numberA = parseInt(a.secretId);
  		var numberB = parseInt(b.secretId);
      answer = numberA-numberB;
    } else {
      console.log("\nSorting By TITLE");
      var titleA = a.secretTitle.toLowerCase();
  		var titleB = b.secretTitle.toLowerCase();
      if(a.secretTitle > b.secretTitle){
        answer = 1;
      } else if(a.secretTitle < b.secretTitle){
        answer = -1;
      }
    }
    return answer;
  });
  fs.writeFile(secretsDirectory + "secrets.json", JSON.stringify(storedSecrets), "utf8", function(err) {
    if(err)
    {
      console.log("\nFailed to save secrets " + err + "\n");
    }
    else {
      console.log("\nSecrets successfully saved :)\n");
    }
    res.redirect("/users/secrets");
    console.log("\nSecrets Reloaded\n");
  });
});

module.exports = router;
