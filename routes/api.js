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
                        launch_path: "/webapp.html?" + appUrl,
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
                    appId: appId,
                    type: "hosted"
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


/**
 * Endpoint for creating packaged apps
 */
router.post("/apps/createpackaged", function (req, res) {

    var appName = req.body && req.body.name,
        appDesc = req.body && req.body.description,
        appPackage = req.files,
        appId   = uuid.createHash("sha1")
                      .update(Date() + appName)
                      .digest('hex')
                      .slice(0,6);

    // Check if appName, appDesc and proper file is provided
    if (appName && appDesc && appPackage && appPackage.packagefile) {
        // Check if provided file is zip file
        if (appPackage.packagefile.mimetype === "application/zip" &&
            appPackage.packagefile.extension === "zip") {
            // File has now successfully uploaded. Insert package checks here.
            apps.insert({
                    manifest: {
                        name: appName,
                        description: appDesc,
                    },
                    appId: appId,
                    type: "packaged",
                    packagefile: appPackage.packagefile.name
                }, function (error) {
                    if (error) {
                        res.json(500, "Oh, noes... couldn't _insert_ it!");
                    } else {
                        res.json(200, {appId: appId});
                    }
                });
        } else {
            res.json(403, {message: "Only .zip files can be uploaded as packages."});
        }
    } else {
        res.json(500, {message: "Invalid data provided."});
    }

});

router.get("/apps/:id", function (req, res) {
    apps.findOne({appId: req.params.id}, function (err, doc) {
        if (err || !doc) {
            res.json(404, { message: "App not found...", err: err});
        } else {
            if (req.query && req.query.prettyprint) {
                res.end(JSON.stringify(doc.manifest, 0, 4), "utf-8");
            } else {
                res.setHeader("Content-Type", "application/x-web-app-manifest+json");
                res.json(200, doc.manifest);
            }
        }
    });
});

module.exports = router;
