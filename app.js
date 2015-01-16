var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require("mongoose");
var session = require("express-session");
var passport = require("passport");

var routes = require('./routes/index');
var standards = require('./routes/api/standards');
var clients = require('./routes/client/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(multer({
 
    dest: "documents/"
 
    }));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: "gogreen"}));
app.use(passport.initialize());
app.use(passport.session());


app.use('/', routes);
app.use('/client/index', clients);
app.use('/api/standards', standards);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// set up mongo database
var connection_string = process.env.MONGOLAB_URI || "localhost:27017/gra";
console.log("CONNECTION STRING: " + connection_string);
mongoose.connect(connection_string);

var db = mongoose.connection;

db.on("error", console.error.bind(console, "Mongoose connection error."));
db.once("open", function () {
     //mongoose.connection.db.dropDatabase(function(err, result) {
     //    if (err) {
     //        console.error.bind(console, "Mongoose database error.");
     //    } else {
     //        console.log("Connected to Mongoose");
     //    }
     //});
    console.log("Connected to Mongoose.");
});

module.exports = app;