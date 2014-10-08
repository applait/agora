var express = require("express"),
    uuid = require("crypto"),
    db = require("../db"),
    path = require("path"),
    fs = require("fs"),
    zip = require("adm-zip");

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
 * Validate manifest for packaged apps
 */
var manifest_validate = function (manifest) {
    if (manifest.hasOwnProperty("name") && manifest.hasOwnProperty("description")
        && manifest.hasOwnProperty("developer") && manifest.hasOwnProperty("icons")
        && manifest.hasOwnProperty("type")) {
        return true;
    }
    return false;
};

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

    var appPackage = req.files;

    // Check if appName, appDesc and proper file is provided
    if (appPackage && appPackage.packagefile) {
        // Check if provided file is zip file
        if (appPackage.packagefile.mimetype === "application/zip" &&
            appPackage.packagefile.extension === "zip") {
            // File has now successfully uploaded. Insert package checks here.
            var packagefilepath = path.join(agora.config.PACKAGE_STORAGE_PATH, appPackage.packagefile.name),
                manifestdata = {},
                pngfiles = {};

            if (fs.existsSync(packagefilepath)) {
                var filesinpack = (new zip(packagefilepath)).getEntries();
                filesinpack.forEach(function (file) {
                    if (file.entryName === "manifest.webapp") {
                        try {
                            manifestdata = JSON.parse(file.getData().toString("utf-8"));
                        } catch (err) {
                            res.status(500).json("Unable to parse manifest.");
                            return;
                        }
                    } else if (/\.png$/i.test(file.entryName)) {
                        pngfiles[file.entryName] = file;
                    }
                });
            }

            if (!manifest_validate(manifestdata)) {
                res.status(403).json("Invalid package. Check if manifest is alright");
                return;
            }

            var appId   = uuid.createHash("sha1")
                    .update(Date() + manifestdata.name)
                    .digest("hex")
                    .slice(0,6);

            try {
                var iconkey = manifestdata.icons["128"] ? manifestdata.icons["128"].replace(/^\//, ''): "";
                pngfiles[iconkey] && fs.writeFileSync(packagefilepath.replace(/\.zip$/i, ".png"),
                                                      pngfiles[iconkey].getData());
                delete pngfiles;
            } catch (err) {
                console.log("Unable to create icon file for " + appId, err);
            }

            var appdata = {
                manifest: {
                    name: manifestdata.name,
                    description: manifestdata.description,
                    icons: manifestdata.icons,
                    developer: manifestdata.developer,
                    package_path: "{SITE_URL}/api/apps/" + appId + "/package.zip",
                    size: appPackage.packagefile.size
                },
                appId: appId,
                type: "packaged",
                originalmanifest: manifestdata,
                packagefile: appPackage.packagefile.name,
                iconfile: appPackage.packagefile.name.replace(/\.zip$/i, ".png"),
                timestamp: Math.round(+new Date()/1000)
            };

            if (manifestdata.locales) {
                appdata.manifest.locales = manifestdata.locales;
            };

            if (manifestdata["default_locale"]) {
                appdata.manifest["default_locale"] = manifestdata["default_locale"];
            }

            apps.insert(appdata, function (error) {
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
 * Provide the package icon
 */
router.get("/apps/:id/icon.png", function (req, res) {
    apps.findOne({appId: req.params.id}, function (err, doc) {
        if (err || !doc) {
            res.status(404).json({ message: "App not found...", err: err});
        } else {
            if (doc.type && (doc.type === "packaged")) {
                res.header('Access-Control-Allow-Origin', '*');
                var iconfile = path.join(agora.config.PACKAGE_STORAGE_PATH,
                                         (doc.iconfile ? doc.iconfile : doc.packagefile.replace(/\.zip$/i, ".png")));
                if (fs.existsSync(iconfile)) {
                    res.sendFile(iconfile);
                } else {
                    res.status(404).json({message: "Icon file not found for the app."});
                }
            } else {
                res.status(404).json({ message: "App icon not found."});
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
            res.status(200).json(doc.manifest);
        }
    });
});

module.exports = router;
