"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable camelcase */
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const express_xml_bodyparser_1 = __importDefault(require("express-xml-bodyparser"));
const localtunnel_1 = __importDefault(require("localtunnel"));
const crypto_1 = __importDefault(require("crypto"));
const simple_unirest_1 = require("../src/official-account/simple-unirest");
async function main() {
    const app = express_1.default();
    app.use(express_xml_bodyparser_1.default({
        explicitArray: false,
        normalize: false,
        normalizeTags: false,
        trim: true,
    }));
    const server = http_1.default.createServer(app);
    server.listen(async () => {
        const listenedPort = server.address().port;
        console.info('listen on port', listenedPort);
        const tunnel = await localtunnel_1.default({
            host: 'https://serverless.social',
            port: listenedPort,
            // subdomain: 'wechaty-puppet-official-account',
            subdomain: 'c9534fb4-4d8d-4b2f-8ee5-ef1d6973364f',
        });
        // https://wechaty-puppet-official-account.serverless.social/
        console.info('tunnel url', tunnel.url);
    });
    const simpleUnirest = simple_unirest_1.getSimpleUnirest('https://api.weixin.qq.com/cgi-bin/');
    const appId = process.env.APP_ID;
    const appSecret = process.env.APP_SECRET;
    const ret = await simpleUnirest
        .get(`token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`);
    console.info('accessToken', ret.body);
    const accessToken = {
        expiresIn: ret.body.expires_in,
        timestamp: Date.now(),
        token: ret.body.access_token,
    };
    app.get('/', (req, res) => {
        const { signature, timestamp, nonce, echostr, } = req.query;
        const data = [
            timestamp,
            nonce,
            process.env.TOKEN,
        ].sort().join('');
        const digest = crypto_1.default
            .createHash('sha1')
            .update(data)
            .digest('hex');
        if (digest === signature) {
            res.end(echostr);
        }
        else {
            res.end();
        }
    });
    app.post('/', async (req, res) => {
        const payload = req.body.xml;
        console.info(payload);
        if (!/ding/i.test(payload.Content)) {
            res.end();
            return;
        }
        const ret = await simpleUnirest
            .post(`message/custom/send?access_token=${accessToken.token}`)
            .type('json')
            .send({
            msgtype: 'text',
            text: {
                content: 'dong',
            },
            touser: payload.FromUserName,
        });
        console.info(ret.body);
        res.end('success');
    });
}
main()
    .catch(console.error);
//# sourceMappingURL=raw-oa.js.map