var express = require("express"),
    config = require("../config"),
    db = require("../db");

var router = express.Router(),
    apps = db.get("apps");

router.get("/", function (req, res) {
    res.status(200).json({"message": "Here be apps"});
});

router.get("/:id", function (req, res) {
    apps.findOne({ appId: req.params.id}).on("success", function (doc) {
        doc.config = agora.config;
        doc.title = doc.manifest.name + " - " + doc.appId + " | Applait Explore";
        res.render("apps/detail.html", doc);
    });
});

module.exports = router;
