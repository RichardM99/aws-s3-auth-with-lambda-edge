/*
 * Replace this function with your own logic for validating
 * the value provided in the Authorization header
 */
function hasAccessCheck(accessKey) {
    if (accessKey === "SECRET_ACCESS_KEY") {
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

module.exports.handler = require("./handler")({ hasAccessCheck });
