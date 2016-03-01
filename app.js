// Requiring the relevant modules, which are primarily used to setup alot of functionality
// of the app
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();

// Requiring the relevant routes for requests to be sent to. Index.js will deal
// mainly with validation e.g. user's logging in, logging out and creating accounts.
var routes = require('./routes/index');

// Users.js will be protected by a check before any requests are passed to it, to
// ensure only users with initialised sessions can try to access the user area of
// the site
var users = require('./routes/users');

// Setting up the views for the app i.e. the Jade files the app will use
// to render and display dynamic content
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Setting a favicon for the site
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// All requests to the server will first filter through the express-session
// module, so that a session id can be generated (i.e. so users can be tracked
// throughout the website to ensure only logged in users can see secrets - and
// that they can only see their own secrets)
app.use("/", session({
    // Accessing the hash key for the session' secret from environment variable 
    // I have set up locally and on Azure, so as to ensure that the data cannot 
    // be comprimised.
    secret: process.env.SessionKey,
    // Setting resave to false
    resave: false,
    // Not saving unitinialised sessions i.e. not saving them until they have had
    // a username property added to them, otherwise they have not yet been verified
    // and so we do not need to track their activity
    saveUninitialized: false
}));

// All requests to the root of the server will then be passes into the index.js route (i.e.
// all requests realting to logging in, logging out and creating accounts)
app.use('/', routes);

// All requests for areas within the /user directory of the website will pass through this
// function before being allowed to pass beyond the root directory. This middleware effectively
// acts as a gate, blocking all users that are not currently logged in from reaching anything
// within the "/users" section of the website (in addition to validation in the users.js route)
app.use("/users", function (req, res, next) {
    
    console.log("Attempt to access user facility");
    
    // Checking if the session's username property is not null i.e. if this session has a username, 
    // then the user is already logged in.
    if (req.session.username != null) {
        console.log("This user is logged in. Taking them to the secrets page.");
        
        // Passing this request on to the next middleware i.e allowing this user past the first gate
        // as they are currently in an active, initialised session
        next();
    } else {
        console.log("This user is not not logged in. Returning them to the home page.");
        
        // This user is not currently logged in, and so will be redirected to the homepage i.e. 
        // attempting to block all requests to the "/users" section of the website from visitors
        // who are not yet logged in
        res.redirect("/");
    }
});

// Any requests for the /users directory that have made it this far are from visitors that appear
// to be logged in i.e. their session appears to have been initialised (which can only happen
// in the login validation section of the index.js route)
app.use('/users', users);

// Catch all for requests that cannot find the relevant router i.e. 404, they cannot be found.
// Creating the appropriate error and forwarding it on to the error handler
app.use(function (req, res, next) {
    var err = new Error('Sorry :( We could not find what you were looking for.)');
    err.status = 404;
    next(err);
});

// Checking if the app is currently running in development mode. If it is, it will print out
// the full stacktrace of the error
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        // Setting the response status to the status of the error. If no status has been set for the
        // error, then defaulting it to 500
        res.status(err.status || 500);
        
        // Rendering the error view, passing in the error message, and the error stack
        res.render('error', {title: "Error "+ err.status, message: err.message, error: err});
    });
}

// If the error has reached this far, then we are not in development mode, and therefore are in
// production mode i.e. we do not want to display the stacktrace of the error to the users
app.use(function (err, req, res, next) {
    
    // Setting the response status to the status of the error. If no status has been set for the
    // error, then defaulting it to 500
    res.status(err.status || 500);
    
    // Rendering the error view, passing in the error message, and a blank object for the error
    // stack (as we will not be displaying this in production mode)
    res.render('error', {message: err.message, error: {} });
});

// Sending the app variable as an export of this module
module.exports = app;
