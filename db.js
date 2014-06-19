var config = require("./config"),
    monk = require("monk"),
    dbpath;

dbpath = (config.DB_USERNAME ? config.DB_USERNAME + ":" + config.DB_PASSWORD + "@" : "") + config.DB_HOST +
    ":" + config.DB_PORT + "/" + config.DB_NAME;

module.exports = monk(dbpath);
