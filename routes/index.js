// Requiring the express module, so that I can use it to generate the router
var express = require('express');
// Creating a new router object using the Router method of express object
var router = express.Router();

// Requiring the database connection I have set up previously, so that it
// can be shared between routes (i.e. so users can login in the index.js route
// and then query their secrets in the users.js route)
var connection = require("../database/connection");

// All requests to get the home page will be handled by this router
router.get('/', function (req, res, next) {
    
    // Checking if the username of the current session is null i.e. if it is,
    // then this user is not currently logged in
    if (req.session.username == null) {
        
        // Creating a cookie to store the index tab number for the homepage i.e.
        // this number is used client-side to decide which tab to dispaly: Login
        // or Create Account. Defaulting this to 0, as this is the Login tab.
        res.cookie("indexTab", 0);
        
        // Creating a cookie to store the user's preference for sorting their secrets
        // i.e. by title or time posted. Defaulting this to time posted. The client-side
        // JavaScript will update the value of this cookie everytime a sort is requested 
        res.cookie("sortBy", "secretTimePosted");
        
        // Rendering the homepage view, with a title of login and no warnings, so that
        // the user can login or create a new account
        res.render('index', {title: "Login", loginWarning: "", createAccountWarning: "" });
    } else {
        
        // Since this session has a username, then the user is already logged in. Redirecting
        // them back to the secrets page i.e. so they cannot try to login to another account
        // while they are still logged in, and also so they do not inadvertantly leave themselves
        // logged in.
        res.redirect("/users/secrets");
    }
});

// All requests to get the home page, with the createAccout tab open, will be handled by this router
router.get('/createAccount', function (req, res, next) {
    
    // Checking if the username of the current session is null i.e. if it is,
    // then this user is not currently logged in
    if (req.session.username == null) {
        // Creating a cookie to store the index tab number for the homepage i.e.
        // this number is used client-side to decide which tab to dispaly: Login
        // or Create Account. Defaulting this to 1, as this is the Create Account
        // tab.
        res.cookie("indexTab", 1);
        
        // Rendering the homepage view, with a title of login and no warnings, so that
        // the user can create a new account
        res.render('index', {title: "Create Account", loginWarning: "", createAccountWarning: "" });
    } else {
        
        // Since this session has a username, then the user is already logged in. Redirecting
        // them back to the secrets page i.e. so they cannot try to login to another account
        // while they are still logged in, and also so they do not inadvertantly leave themselves
        // logged in.
        res.redirect("/users/secrets");
    }
});

// All requests to get the home page, with the login tab open, will be handled by this router
router.get('/login', function (req, res, next) {
    
    // Checking if the username of the current session is null i.e. if it is,
    // then this user is not currently logged in
    if (req.session.username == null) {
        
        // Creating a cookie to store the index tab number for the homepage i.e.
        // this number is used client-side to decide which tab to dispaly: Login
        // or Create Account. Defaulting this to 0, as this is the Login tab.
        res.cookie("indexTab", 0);
        
        // Rendering the homepage view, with a title of login and no warnings, so that
        // the user can login
        res.render('index', {title: "Login", loginWarning: "", createAccountWarning: "" });
    } else {
        
        // Since this session has a username, then the user is already logged in. Redirecting
        // them back to the secrets page i.e. so they cannot try to login to another account
        // while they are still logged in, and also so they do not inadvertantly leave themselves
        // logged in.
        res.redirect("/users/secrets");
    }
});

// All requests to logout of an account will be handled by this router
router.post("/logout", function (req, res, next) {
    
    // Checking if the username of the current session is not null i.e. if it is,
    // then this user still currently logged in
    if (req.session.username != null) {
        
        // Destroying the current session so that no futher interactions can happen within
        // this user's account until they login again
        req.session.destroy();
    }
    
    // Rendering the homepage view, with a title of login and no warnings, so that
    // the user can create a new account
    res.render('index', {title: "Create Account", loginWarning: "You have successfully logged out. Please close this tab to ensure noone else can access your secrets while you're away.", createAccountWarning: "" });
});

// All requests to post to create a new account will be handled by this router
router.post('/createAccount', function (req, res, next) {
    
    // Checking that the current session's username is null (i.e. that this visitor is not
    // already logged in). Checking that the length of the username and password in the request
    // are greater than 0. This check is also completed on the client-side, but just want to ensure
    // that no anomolies occur in the database
    if (req.session.username == null && req.body.username.length > 0 && req.body.password.length > 0) {
        console.log("Attempting to create a new user account");
        
        // Checking if the requested username already exists in the database by querying the User table
        // based on the requested username. Using the escape() method of the connection object to add
        // "" around the value of the user submitted data (as requested by the API of the mysql module)
        connection.query("SELECT * FROM User WHERE username = " + connection.escape(req.body.username), function (err, rows, fields) {
            // Checking if any errors were thrown by the query
            if (err) {
                console.log("Unable to query database to check if this username exists " + err);
                
                // Creating a cookie to store the index tab number for the homepage i.e.
                // this number is used client-side to decide which tab to dispaly: Login
                // or Create Account. Resetting this to 1, as this is the Create Account tab.
                res.cookie("indexTab", 1);
                
                // Rendering the homepage of the website, with a title of Create account, and a warning to
                // display on the create account form that there was an unexpected error
                res.render("index", {title: "Create Account", loginWarning: "", createAccountWarning: "There was an unexpected err. Please try again." });
            
            } else if (rows.length == 0) {
                //If no results came back, then this username is available
                
                // Inserting a new row into the User table, passing in the requested username and password
                // specified in the request body. Using the escape() method of the connection object to add
                // "" around the value of the user submitted data (as requested by the API of the mysql module).
                // Encrypting the value of the password column, so that even if the database were to be comprimised,
                // this data would be secured.
                connection.query("INSERT INTO User(username, userPassword) VALUES(" + connection.escape(req.body.username) + ", AES_ENCRYPT(" + connection.escape(req.body.password) + ", " + connection.escape(process.env.PasswordKey) + "))", function (err, rows, fields) {
                    
                    // Checking if there were any errors with this query
                    if (err) {
                        console.log("\Unable to add " + req.body.username + " as a new user: " + err);
                        
                        // Rendering the homepage of the website, with a title of Create account, and a warning to
                        // display on the create account form that there was an unexpected error
                        res.render("index", {title: "Create Account", loginWarning: "", createAccountWarning: "There was an unexpected err. Please try again."});  
                    } else {
                        console.log("New user " + req.body.username + " successfully added");
                        
                        // Setting the session username to be equal to that of the request body username, so 
                        // that this session will be initialised, and so I can now check if the user is still
                        // logged in
                        req.session.username = req.body.username;
                        
                        // Redirecting the new user to the login page. Using a redirect so that I do not have to 
                        // confirm a user's login credentials in multiple routers. By redirecting, all users will
                        // be shown taken to their secrets in the same way, regardless of them being an existing user,
                        // a logged in user or a new user. This also means that any additional security checks I want
                        // to preform can be done in the login router only
                        res.redirect("/login");
                    }
                });
            } else {
                
                // If the length of the rows returned from the query above is greater than 0, then this username 
                // is already taken, and this user cannot create a new account with it
                console.log("Cannot create new user " + req.body.username + ". This username is already taken");
                
                // Ensuring the index tab of the homepage is set to the create account tab (as this is where the
                // user came from)
                res.cookie("indexTab", 1);
                
                // Rendering the homepage of the website, with a title of Create account, and a warning to
                // display on the create account form that this username is already taken
                res.render("index", {title: "Create Account", loginWarning: "", createAccountWarning: "The username " + req.body.username + " is already taken." });
            }
        });
    } else {
        
        // If the current session's username is null (i.e. that this visitor is already logged in), or the
        // length of the username and password in the request body are not greater than 0, i.e. one or both
        // of them are empty, then a new user account cannot be created. This check is also completed on the
        // client-side, but just want to ensure that no anomolies occur in the database
        
        // Ensuring the index tab of the homepage is set to the create account tab (as this is where the
        // user came from)
        res.cookie("indexTab", 1);
        
        // Rendering the homepage of the website, with a title of Create account, and a warning to
        // display on the create account form that the username and password are not valid
        res.render("index", {title: "Create Account", loginWarning: "", createAccountWarning: "Please enter a valid username and password."});
    }
});

// All requests to post to login will be handled by this router
router.post('/login', function (req, res, next) {
    
    // Checking that either the username of the request body, or that of the current session, 
    // are not null i.e. whether the user was directed to this page following a login, or following
    // creating a new account, that a username is available to be tested against the database
    if (req.body.username != null || req.session.username != null) {
        
        // Creating a temporary variable, using a ternary operator, which will store the value of
        // whichever username is currently available. This will depend on where the user was redirected
        // here from i.e. they may have logged in, or created a new account
        var currentUsername = req.session.username != null ? req.session.username : req.body.username;
        
        // Querying the database to confirm that this username does infact belong to a registered user.
        // If it does, returning the 
        connection.query("SELECT AES_DECRYPT(userPassword, " + connection.escape(process.env.PasswordKey) + ") AS 'userPassword' FROM User WHERE username = " + connection.escape(currentUsername), function (err, rows, fields) {
            if (err) {
                console.log("Unable query the database to see if " + currentUsername + " exists " + err);
                res.cookie("indexTab", 0);
                res.render("index", {title: "Login", loginWarning: "There was an unexpected issue with your login. Please try again.", createAccountWarning: "" });
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
                            res.render("index", {title: "Login", loginWarning: "Incorrect password for " + req.body.username + ". Please try again.", createAccountWarning: "" });
                        }
                    }
                } else if (req.session.username != null) {
                    console.log(req.body.username + " is already logged in - Login Authenticated");
                    res.redirect("/users/secrets");
                } else {
                    console.log(req.body.username + " is not a registered username");
                    res.cookie("indexTab", 0);
                    res.render("index", {title: "Login", loginWarning: req.body.username + " is not a registered username.", createAccountWarning: "" });
                }
            }
        });
    } else {
        console.log("There is no request username, or session username, to compare to the database");
        res.cookie("indexTab", 0);
        res.render("index", {title: "Login", loginWarning: "There was an unexpected issue with your login. Please try again.", createAccountWarning: "" });
    }
});

module.exports = router;
