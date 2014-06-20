var express = require("express"),
    uuid = require("crypto"),
    db = require("../db");

var router = express.Router(),
    apps = db.get("apps");

router.post("/apps/create", function (req, res) {
    var appName = req.body && req.body.name,
        appDesc = req.body && req.body.description,
        appUrl  = req.body && req.body.url.replace(/\/$/, ""),
        appId   = uuid.createHash("sha1")
                      .update(Date() + appUrl)
                      .digest('hex')
                      .slice(0,6);

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    if (appName && appUrl && appDesc) {
        apps.findOne({ appId: appId}).on("success", function (doc) {
            if (doc) {
                appId = appId.split('').slice(0, -1)
                    .push(String.fromCharCode(Math.floor((Math.random() * 6) + 97))).join('');
            } else {

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
                    appId: appId
                }, function (error) {
                    if (error) {
                        res.json(500, "Oh, noes... couldn't _insert_ it!");
                    } else {
                        res.json(200, {appId: appId});
                    }
                });

            }

        });

    } else {
        res.json(500, {message: "Invalid data provided."});
    }

});

router.get("/apps/:id", function (req, res) {
    apps.findOne({appId: req.params.id}, function (err, doc) {
        if (err || !doc) {
            res.json(404, { message: "App not found..."});
        } else {
            if (req.query && req.query.prettyprint) {
                res.end(JSON.stringify(doc.manifest, 0, 4), "utf-8");
            } else {
                res.json(200, doc.manifest);
            }
        }
    });
});

module.exports = router;
