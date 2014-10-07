var express = require("express"),
    config = require("../config");

var router = express.Router();

router.get("/packaged", function (req, res) {
    res.render("upload/packaged.html");
});

module.exports = router;
