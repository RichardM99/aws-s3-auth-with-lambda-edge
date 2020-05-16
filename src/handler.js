"use strict";

const {
    getStatusText,
    UNAUTHORIZED,
    INTERNAL_SERVER_ERROR
} = require("http-status-codes");

module.exports = ({ hasAccessCheck }) => async (event, context, callback) => {
    try {
        const { request } = event.Records[0].cf;
        const { authorization } = request.headers;

        if (!authorization) {
            log({
                level: "info",
                message: "MISSING_AUTHORIZATION_HEADER",
                context
            });

            return send(UNAUTHORIZED, callback);
        }

        const hasAccess = await hasAccessCheck(authorization[0].value);

        if (!hasAccess) {
            log({
                level: "info",
                message: "INVALID_ACCESS_KEY",
                context
            });

            return send(UNAUTHORIZED, callback);
        }

        return callback(null, request);
    } catch (err) {
        log({
            level: "error",
            message: err.message,
            context
        });

        return send(INTERNAL_SERVER_ERROR, callback);
    }
};

/*
 * Helpers
 */
const send = (httpStatusCode, callback) => {
    return callback(null, {
        status: httpStatusCode, // status is the only required key for the response
        statusDescription: getStatusText(httpStatusCode),
        body: getStatusText(httpStatusCode)
    });
};

const log = ({ level, message, context }) => {
    const log = {
        level,
        context: {
            functionName: context.functionName,
            functionVersion: context.functionVersion
        },
        message
    };
    console.log(JSON.stringify(log, null, 2));
};
