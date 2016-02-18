var express = require('express');
var router = express.Router();
var fs = require("fs");
var storedSecrets;

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
  storedSecrets = JSON.parse(fs.readFileSync("./bin/secrets.json", "utf8"));
  //console.log(storedSecrets);
  res.render('secrets', {username: req.body.username, secrets: storedSecrets});
});

router.post('/secrets/modifySecrets', function (req, res, next){
  if(req.body.submit == "Delete this Secret"){
    console.log("\n User wants to delete " + req.body.secretId + "\n");
    for(var i = 0; i < storedSecrets.length; i++){
      if(storedSecrets[i].secretId == req.body.secretId){
        storedSecrets.splice(i, 1);
      }
    }
  } else if (req.body.submit == "Keep my Secret"){
    console.log("New Secret Recieved: " + req.body.secretTitle);
    var newSecret = {secretTitle: req.body.secretTitle, secret: req.body.secret, secretId: (new Date).getTime()};
    storedSecrets.push(newSecret);
  }
  fs.writeFile("./bin/secrets.json", JSON.stringify(storedSecrets), "utf8", function(err) {
    if(err)
    {
      console.log("Failed to save secrets " + err);
    }
    else {
      console.log("Secrets successfully saved :)");
    }
    res.redirect("/users/secrets");
  });
});

module.exports = router;
