var express = require('express');
var router = express.Router();
var util = require('util');
var fs = require('fs-extra');
var mongoose = require('mongoose');
var Standard = require('../models/standard').Standard;

var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var utils = require("../utils/utils");
var Client = require("../models/client").Client;

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: "Green My Restaurant"});
});

router.get('/gui', function (req, res) {
    res.render('gui', {});
})

/* POST login user. */
router.post("/login", passport.authenticate("local-login"), function(req, res) {
    utils.sendSuccessResponse(res, {user: req.user});
});

/* GET current user */
router.get("/current_auth", function(req, res) {
    if (req.user) {
        var user = req.user[0];
        delete user.password
        return utils.sendSuccessResponse(res, {user: user});
    }
    return utils.sendSuccessResponse(res, {user: undefined});
})

router.get("/logout", function(req, res) {
    req.logout();
    utils.sendSuccessResponse(res, {});
})

router.post('/upload', function (req, res, next) {
    if (req.files) {
        //console.log(util.inspect(req.files));
        if (req.files.myFile.size === 0) {
            return next(new Error("Hey, first would you select a file?"));
        }
        fs.exists(req.files.myFile.path, function (exists) {
            if (exists) {
                fs.readFile(req.files.myFile.path, 'utf8', function (err, data) {
                    data = data.trim();
                    var lines = data.split("\n");
                    console.log("Line: ", lines.splice(0, 1));
                    Standard.find({category: lines[0].split(",")[0]}).exec(function (err, existingStandards) {
                        var latestMatched = 0;
                        var uploadId = Math.round(Math.random() * 10000);
                        for (var i in lines) {
                            var standardData = lines[i].split(",");
                            var existence = alreadyExists(existingStandards, standardData[2], latestMatched);
                            if (standardData[0].trim() != "" && !existence.found) {
                                var optionsList = standardData[3].split(";;");
                                var gpsList = standardData[4].split(";;");
                                //var filtersList = standardData[6].split(";;");
                                if (optionsList.length === gpsList.length) {
                                    var options = [];
                                    for (var index = 0; index < optionsList.length; index++)
                                        options.push({ text: optionsList[index], points: Number(gpsList[index]) });
                                    var standard = new Standard({ category: standardData[0], item: "Don't have yet.", question: standardData[2], optionList: options, uploadId: uploadId });
                                    standard.save();
                                }
                            } else {
                                latestMatched = existence.latestMatched;
                            }
                        }
                        removeOldStandards(existingStandards, existence.latestMatched);
                        res.end("Got your file!");
                    });
                });
            } else {
                res.end("Well, there is no magic for those who don�t believe in it!");
            }
        });
    }
});

var alreadyExists = function (existingStandards, question, latestMatched) {
    for (var index = latestMatched; index < existingStandards.length; ++index) {
        if(existingStandards[index].question === question)
        {
            console.log(index);
            existingStandards[index].matched = true;
            var latest = (index === latestMatched) ? latestMatched + 1 : latestMatched;
            return { found: true, latestMatched: latest };
        }
    }
    return { found: false, latestMatched: latestMatched };
};

var removeOldStandards = function (existingStandards, latestMatched) {
    console.log(latestMatched);
    for (var index = latestMatched; index < existingStandards.length; ++index) {
        if (!existingStandards[index].matched)
            Standard.findByIdAndRemove(existingStandards[index]._id);
    }
}

// Passport strategy for logging in
passport.use("local-login", new LocalStrategy(function(username, password, done) {

    Client.login(username, password, function(err, user) {
        if (err) {
            return done(err);
        } else if (!user) {
            return done(null, false, {message: "Invalid username/password"});
        } else {
            return done(null, user);
        }
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.username);
});

passport.deserializeUser(function(username, done) {

    Client.find({username: username}, function(err, user) {
        if (err) {
            done(err);
        } else {
            done(null, user);
        }
    });
});

module.exports = router;
