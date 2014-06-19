var express = require("express"),
    uuid = require("shortid"),
    config = require("../config"),
    db = require("../db");

var router = express.Router(),
    apps = db.get("apps");

router.post("/apps/create", function (req, res) {
    var appName = req.body && req.body.name,
        appDesc = req.body && req.body.description,
        appUrl  = req.body && req.body.url.replace(/\/$/, ""),
        appId   = uuid.generate();

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    if (appName && appUrl && appDesc) {
        apps.insert({
            manifest: {
                name: appName,
                description: appDesc,
                launch_path: appUrl,
                icons: {
                   "60": "/assets/img/icon_60.png",
                   "128": "/assets/img/icon_128.png"
                },
                developer: {
                name: "Applait",
                    url: "http://applait.io/"
                },
                default_locale: "en"
            },
            id: appId
        }, function (error) {
            if (error) {
                res.json(500, "Oh, noes... couldn't _insert_ it!");
            } else {
                res.json(200, {appId: appId});
            }
        });
    } else {
        res.json(500, {message: "Invalid data provided."});
    }

});

module.exports = router;
