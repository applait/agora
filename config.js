var config = {
    REPO_USERNAME : "applait",
    REPO_SLUG     : "agora",
    APP_DNS       : process.env.OPENSHIFT_DNS || "localhost:1337",
    APP_IP        : process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
    APP_PORT      : process.env.OPENSHIFT_NODEJS_PORT || "1337",
    DB_HOST       : process.env.OPENSHIFT_MONGODB_DB_HOST || "localhost",
    DB_PORT       : process.env.OPENSHIFT_MONGODB_DB_PORT || "27017",
    DB_USER       : process.env.OPENSHIFT_MONGODB_DB_USERNAME || "",
    DB_PASS       : process.env.OPENSHIFT_MONGODB_DB_PASSWORD || "",
    DB_NAME       : "instanceof",

    endpoint : function (str) {
        return config.APIBASE + str.replace(/\{user\}/, config.REPO_USERNAME).replace(/\{repo\}/, config.REPO_SLUG);
    },

    loggedin : function (req, res, next) {
        if (req.user) {
            next();
        } else {
            res.redirect("/login");
        }
    }
};

module.exports = config;
