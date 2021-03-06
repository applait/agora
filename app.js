#!/usr/bin/env node

var express = require("express"),
    path = require("path"),
    fs = require("fs"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    cookieParser = require("cookie-parser"),
    config = require("./config"),
    nunjucks = require("nunjucks"),
    multer = require("multer");

var app = express();

// Create a globally shared configuration object
global.agora = {
    config: config
};

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
app.use(multer({
    dest: "./storage/",
    limits: {
        fileSize: 3000000 // 3MB in bytes
    }
}));

// --- Begin routes ---- //
app.use("/", require("./routes/home"));
app.use("/api", require("./routes/api"));
app.use("/apps", require("./routes/apps"));
app.use("/upload", require("./routes/upload"));

// Start the server
var server = app.listen(config.APP_PORT, config.APP_IP, function () {
    console.log("Listening on port %d", server.address().port);
});
