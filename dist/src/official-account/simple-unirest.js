"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSimpleUnirest = void 0;
const unirest = require('unirest');
function getSimpleUnirest(endpoint) {
    // const auth = 'Basic ' + Buffer.from(apiKey + ':' + 'X').toString('base64')
    const headers = {
    //   Authorization: auth,
    };
    return {
        get: (url) => unirest
            .get(endpoint + url)
            .headers(headers),
        post: (url) => unirest
            .post(endpoint + url)
            .headers(headers),
    };
}
exports.getSimpleUnirest = getSimpleUnirest;
//# sourceMappingURL=simple-unirest.js.map