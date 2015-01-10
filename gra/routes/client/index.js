var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var utils = require("../../utils/utils");
var Client = require("../../models/client").Client;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('cient/index', { title: 'For Clients Only' });
});

/**
 * POST registers client
 * @param {String} username the username of the new user
 * @param {String} password the password of the new user
 * @return {JSON} an object with a 'content.user' field, containing the new user
 * @error {400 Bad Request} if the username provided matches an existing user
 * @error {400 Bad Request} if the username is not a valid kerberos ID
 */
router.post("/", function(req, res) {

    var username = req.body.username;
    var password = req.body.password;

    Client.findOne({username: username}, function(err, client) {
        
        if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');

        // user does not exist, create
        if (!client) {
            
            Client.register(username, password, function(err, u) {
                if (err) return utils.sendErrResponse(res, 500, "Error saving new user.");
                // don't pass password to client side
                delete u.password;
                utils.sendSuccessResponse(res, {client: u});
            });

        // user already exists
        } else {
            utils.sendErrResponse(res, 400, "400: User already exists.");
        }
    });
});

/* PUT updates GPs of client */
router.put('/', utils.restrict, function(req, res) {

});

router.get('/:id', function(req, res) {
	Client.findOne( {_id: req.params.id} ).exec(function(err, client) {
		if (err) return utils.sendErrResponse(res, 500, 'An unknown error occurred.');
		if (!client) return utils.sendErrResponse(res, 500, 'Resource not found: Client does not exist.');
		utils.sendSuccessResponse(res, {client: client});
	})
});

module.exports = router;