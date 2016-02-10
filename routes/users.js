var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function(req, res, next){
  if(req.body.username == "Laura" && req.body.password == "password"){
    res.send('You have successfully logged in using the username: ' + req.body.username + " and password: " + req.body.password);
  } else{
    next();
  }
});

router.post('/login', function(req, res, next){
  var err = new Error('Wrong Username or Password');
  err.status = 401;
  res.render("loginError", {message:"Wrong Username or Password", error: err})
});

module.exports = router;
