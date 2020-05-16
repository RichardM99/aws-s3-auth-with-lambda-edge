"use strict";

/* eslint-disable no-undef */

const { expect } = require("chai");

const context = makeContext();
let event;
let result;

describe(`LambdaEdge handler`, () => {
    let handler = require("./handler")({ hasAccessCheck });

    beforeEach(`create a dummy CloudFront event object`, () => {
        event = makeCloudFrontEvent();
    });

    describe(`missing Authorization header`, () => {
        beforeEach(async () => {
            await handler(event, context, callback);
        });
        it(`should have status 401`, () => {
            expect(result.status).to.equal(401);
        });
        it(`should have statusDescription 'Unauthorized'`, () => {
            expect(result.statusDescription).to.equal(`Unauthorized`);
        });
        it(`should have body 'Unauthorized'`, () => {
            expect(result.body).to.equal(`Unauthorized`);
        });
    });

    describe(`sending invalid Authorization header`, () => {
        beforeEach(async () => {
            setInvalidHeaders();
            await handler(event, context, callback);
        });
        it(`should have status 401`, () => {
            expect(result.status).to.equal(401);
        });
        it(`should have statusDescription 'Unauthorized'`, () => {
            expect(result.statusDescription).to.equal(`Unauthorized`);
        });
        it(`should have body 'Unauthorized'`, () => {
            expect(result.body).to.equal(`Unauthorized`);
        });
    });

    describe(`sending valid Authorization header`, () => {
        beforeEach(async () => {
            setValidHeaders();
            await handler(event, context, callback);
        });
        it(`should allow the request through`, () => {
            expect(result).to.equal(event.Records[0].cf.request);
        });
    });

    describe(`internal server error`, () => {
        beforeEach(async () => {
            handler = require("./handler")({ hasAccessCheck: throwsError });
            setValidHeaders();
            await handler(event, context, callback);
        });
        it(`should have status 500`, () => {
            expect(result.status).to.equal(500);
        });
        it(`should have statusDescription 'Internal Server Error'`, () => {
            expect(result.statusDescription).to.equal(`Server Error`);
        });
        it(`should have body 'Internal Server Error'`, () => {
            expect(result.body).to.equal(`Server Error`);
        });
    });
});

/**
 * Helpers
 */
function hasAccessCheck(accessKey) {
    if (accessKey === "YOUR_SECRET_ACCESS_KEY") {
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
}

function throwsError() {
    throw new Error("SOMETHING_WENT_WRONG");
}

function makeContext() {
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
    return {
        functionName: "{your-stack-name}-{the-env}-LambdaEdge-someRandomAWSId",
        functionVersion: "1"
    };
}

function callback(err, res) {
    if (err) {
        return console.error(err);
    }
    result = res;
}

function makeCloudFrontEvent() {
    // see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html
    // for how CloudFront passes events to Lambda@Edge
    return {
        Records: [
            {
                cf: {
                    request: {
                        httpMethod: "GET",
                        uri: "",
                        headers: {},
                        origin: {
                            s3: {}
                        }
                    }
                }
            }
        ]
    };
}

function setInvalidHeaders() {
    setRequestHeadersAs({
        authorization: [
            {
                key: "Authorization",
                value: "INVALID_ACCESS_KEY"
            }
        ]
    });
}

function setValidHeaders() {
    setRequestHeadersAs({
        authorization: [
            {
                key: "Authorization",
                value: "YOUR_SECRET_ACCESS_KEY"
            }
        ]
    });
}

function setRequestHeadersAs(value) {
    event.Records[0].cf.request.headers = value;
}
