var express = require("express"),
    config = require("../config");

var router = express.Router();


router.get("/", function (req, res) {
    res.render("home/index.html");
});


module.exports = router;
