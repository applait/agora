var express = require("express"),
    config = require("../config"),
    db = require("../db");

var router = express.Router(),
    apps = db.get("apps");

router.get("/", function (req, res) {
    res.json(200, {"message": "Here be apps"});
});

router.get("/:id", function (req, res) {
    apps.findOne({ appId: req.params.id}).on("success", function (doc) {
        doc.config = agora.config;
        res.render("apps/detail.html", doc);
    });
});

module.exports = router;
