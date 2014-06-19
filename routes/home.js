var express = require("express"),
    config = require("../config");

var router = express.Router();

router.get(["/","/index", "/index.html"], function (req, res) {
    res.render("home/index.html");
});

router.get("/manifest.webapp", function (req, res) {
    var manifest = {
        name: "Applait",
        description: "Firefox OS apps, baked and served hot.",
        launch_path: "/index.html",
        icons: {
           "60": "/assets/img/icon_60.png",
           "128": "/assets/img/icon_128.png"
        },
        developer: {
        name: "Your name or organization",
            url: "http://applait.io/"
        },
        default_locale: "en"
    }

    res.json(200, manifest);
});

module.exports = router;
