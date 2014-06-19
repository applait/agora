var config = require("./config"),
    monk = require("monk"),
    dbpath;

dbpath = (config.DB_USER ? config.DB_USER + ":" + config.DB_PASS + "@" : "") + config.DB_HOST +
    ":" + config.DB_PORT + "/" + config.DB_NAME;

module.exports = monk(dbpath);
