#!/usr/bin/env node

var express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    cookieParser = require("cookie-parser"),
    config = require("./config"),
    nunjucks = require("nunjucks");

var app = express();


// Configure template engine
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// Configure application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser("banana"));
app.use("/assets", express.static(path.join(__dirname, 'assets')));
app.use("/", express.static(path.join(__dirname, 'static')));
app.use(session({ secret: "potato" }));

// --- Begin routes ---- //
app.use("/", require("./routes/home"));
app.use("/api", require("./routes/api"));

// Start the server
var server = app.listen(config.APP_PORT, config.APP_IP, function () {
    console.log("Listening on port %d", server.address().port);
});
