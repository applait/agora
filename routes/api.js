var express = require("express"),
    uuid = require("crypto"),
    db = require("../db");

var router = express.Router(),
    apps = db.get("apps");

/**
 * Clean up tokens and prep up manifest for output
 */
var manifest_prepare = function (manifest) {
    manifest.package_path &&
        (manifest.package_path = manifest.package_path.replace("{SITE_URL}",
                                                               agora.config.SITE_URL));
    return manifest;
}

/**
 * Endpoint for creating hosted app
 */
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
                    type: "hosted",
                    timestamp: Math.round(+new Date()/1000)
                }, function (error) {
                    if (error) {
                        res.status(500).json("Oh, noes... couldn't _insert_ it!");
                    } else {
                        res.status(200).json({ appId: appId });
                    }
                });

            }

        });

    } else {
        res.status(500).json({message: "Invalid data provided."});
    }

});


/**
 * Endpoint for creating packaged apps
 *
 * @TODO: Add package checks
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
                        icons: {
                           "60": "/assets/img/icon_60.png",
                           "128": "/assets/img/icon_128.png"
                        },
                        developer: {
                            name: "Applait",
                            url: "http://applait.io/"
                        },
                        default_locale: "en",
                        package_path: "{SITE_URL}/api/apps/" + appId + "/package.zip",
                        size: appPackage.packagefile.size
                    },
                    appId: appId,
                    type: "packaged",
                    packagefile: appPackage.packagefile.name,
                    timestamp: Math.round(+new Date()/1000)
                }, function (error) {
                    if (error) {
                        res.status(500).json("Oh, noes... couldn't _insert_ it!");
                    } else {
                        res.status(200).json({ appId: appId });
                    }
                });
        } else {
            res.status(403).json({message: "Only .zip files can be uploaded as packages."});
        }
    } else {
        res.status(500).json({message: "Invalid data provided."});
    }

});


/**
 * Output only the manifest of an app as "application/x-web-app-manifest+json" content-type
 */
router.get("/apps/:id/manifest.webapp", function (req, res) {
    apps.findOne({appId: req.params.id}, function (err, doc) {

        if (err || !doc) {
            res.status(404).json({ message: "App not found...", err: err});
        } else {
            res.setHeader("Content-Type", "application/x-web-app-manifest+json");
            doc.manifest = manifest_prepare(doc.manifest);
            res.status(200).json(doc.manifest);
        }
    });
});


/**
 * Provide the package file for a packaged app for download
 */
router.get("/apps/:id/package.zip", function (req, res) {
    apps.findOne({appId: req.params.id}, function (err, doc) {
        if (err || !doc) {
            res.status(404).json({ message: "App not found...", err: err});
        } else {
            if (doc.type && (doc.type === "packaged")) {
                res.header('Access-Control-Allow-Origin', '*');
                res.sendFile(agora.config.PACKAGE_STORAGE_PATH + "/" + doc.packagefile);
            } else {
                res.status(404).json({ message: "App is not a packaged app."});
            }
        }
    });
});

/**
 * Output vital (non-sensitive) information of an app as plain JSON
 */
router.get("/apps/:id", function (req, res) {
    apps.findOne({appId: req.params.id}, function (err, doc) {
        if (err || !doc) {
            res.status(404).json({ message: "App not found...", err: err});
        } else {
            doc.manifest = manifest_prepare(doc.manifest);
            res.end(JSON.stringify(doc.manifest, 0, 4), "utf-8");
        }
    });
});

module.exports = router;
