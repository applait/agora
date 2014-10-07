var express = require("express"),
    config = require("../config");

var router = express.Router();

router.get(["/","/index", "/index.html"], function (req, res) {
    res.render("home/index.html");
});

router.get("/manifest.webapp", function (req, res) {
    var manifest = {
        name: "Applait Explore",
        description: "Test drive your Firefox OS apps.",
        launch_path: "/index.html",
        icons: {
            "60": "/assets/img/icon_60.png",
            "128": "/assets/img/icon_128.png"
        },
        developer: {
            name: "Applait",
            url: "http://applait.com/"
        },
        default_locale: "en"
    };

    res.setHeader("Content-Type", "application/x-web-app-manifest+json");
    res.status(200).json(manifest);
});

module.exports = router;
