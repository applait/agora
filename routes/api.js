var express = require("express"),
    config = require("../config"),
    db = require("../db");

var router = express.Router();


router.post("/apps/create", function (req, res) {
    var appname = req.body && req.body.name,
        appdescription = req.body && req.body.description,
        appurl = req.body && req.body.url.replace(/\/$/, "");

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    if (appname && appurl && appdescription) {
        res.json(200, {message: "Ok"});
    } else {
        res.json(500, {message: "Invalid data provided."});
    }

});

module.exports = router;
