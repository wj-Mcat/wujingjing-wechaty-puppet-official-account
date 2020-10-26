"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Webhook = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const express_xml_bodyparser_1 = __importDefault(require("express-xml-bodyparser"));
const localtunnel_1 = __importDefault(require("localtunnel"));
const wechaty_puppet_1 = require("wechaty-puppet");
const events_1 = require("events");
const WebhookEventEmitter = events_1.EventEmitter;
class Webhook extends WebhookEventEmitter {
    constructor(options) {
        super();
        this.options = options;
        this.messageCache = {};
        this.userOpen = {};
        wechaty_puppet_1.log.verbose('Webhook', 'constructor(%s)', JSON.stringify(options));
        if (typeof options.port !== 'undefined' && options.webhookProxyUrl) {
            throw new Error('Please only provide either `port` or `webhookProxyUrl` for Webhook');
        }
        if (typeof options.port === 'undefined' && !options.webhookProxyUrl) {
            throw new Error('Please provide either `port` or `webhookProxyUrl` for Webhook');
        }
        this.personalMode = options.personalMode;
        if (options.webhookProxyUrl) {
            const result = this.parseWebhookProxyUrl(options.webhookProxyUrl);
            if (!result) {
                throw new Error(`Webhook: invalid webhookProxyUrl ${options.webhookProxyUrl}`);
            }
            this.webhookProxyHost = result.host;
            this.webhookProxySchema = result.schema;
            this.webhookProxySubDomain = result.name;
        }
    }
    parseWebhookProxyUrl(webhookProxyUrl) {
        wechaty_puppet_1.log.verbose('Webhook', 'parseSubDomain(%s)', webhookProxyUrl);
        /**
         * Huan(20208): see webhook.spec.ts unit tests.
         *  server: https://github.com/localtunnel/server
         */
        const URL_RE = /(https?):\/\/([^.]+)\.(.+)/i;
        const matches = webhookProxyUrl.match(URL_RE);
        if (!matches) {
            wechaty_puppet_1.log.warn('Webhook', 'parseSubDomain() fail to parse %s', webhookProxyUrl);
            return;
        }
        const [, // skip matches[0]
        schema, name, host,] = matches;
        wechaty_puppet_1.log.verbose('Webhook', 'parseSubDomain() schema: %s, name: %s, host: %s', schema, name, host);
        return {
            host,
            name,
            schema,
        };
    }
    async start() {
        wechaty_puppet_1.log.verbose('Webhook', 'start()');
        const app = express_1.default();
        app.use(express_xml_bodyparser_1.default({
            explicitArray: false,
            normalize: false,
            normalizeTags: false,
            trim: true,
        }));
        app.get('/', this.appGet.bind(this));
        app.post('/', this.appPost.bind(this));
        this.on('instantReply', (msg) => {
            if (this.userOpen[msg.touser]) {
                this.messageCache[msg.touser] = msg;
            }
            else {
                throw Error('Webhook: personal mode only allow reply once and within 4s');
            }
        });
        const server = this.server = http_1.default.createServer(app);
        await new Promise((resolve, reject) => {
            /**
             * 1. for local port
             */
            if (typeof this.options.port !== 'undefined') {
                server.listen(this.options.port, resolve);
                return;
            }
            /**
             * 2. for tunnel helper
             */
            server.listen(() => {
                const listenedPort = server.address().port;
                this.setupTunnel(listenedPort)
                    .then(resolve)
                    .catch(reject);
            });
        });
    }
    async stop() {
        wechaty_puppet_1.log.verbose('Webhook', 'stop()');
        if (this.tunnel) {
            this.tunnel.close();
            this.tunnel = undefined;
        }
        if (this.server) {
            this.server.close();
            this.server = undefined;
        }
    }
    async setupTunnel(port) {
        wechaty_puppet_1.log.verbose('Webhook', 'setupTunnel(%s)', port);
        const host = `${this.webhookProxySchema}://${this.webhookProxyHost}`;
        const tunnel = await localtunnel_1.default({
            host,
            port,
            subdomain: this.webhookProxySubDomain,
        });
        wechaty_puppet_1.log.verbose('Webhook', 'setupTunnel() created at %s', tunnel.url);
        if (tunnel.url !== this.options.webhookProxyUrl) {
            throw new Error(`Webhook: webhookUrlUrl is not available ${this.options.webhookProxyUrl}`);
        }
        tunnel.on('close', () => {
            wechaty_puppet_1.log.verbose('Webhook', 'setupTunnel() tunnel.on(close)');
            // TODO: check if need to reconnect at here.
            // FIXME: try to recover by restarting, or throw error when can not recover
        });
        this.tunnel = tunnel;
    }
    async appGet(req, res) {
        wechaty_puppet_1.log.verbose('Webhook', 'appGet({url: %s})', req.url);
        const { signature, timestamp, nonce, echostr, } = req.query;
        if (this.options.verify({
            nonce,
            signature,
            timestamp,
        })) {
            wechaty_puppet_1.log.verbose('Webhook', 'appGet() verify() succeed');
            res.end(echostr);
        }
        else {
            wechaty_puppet_1.log.verbose('Webhook', 'appGet() verify() failed');
            res.end();
        }
    }
    async appPost(req, res) {
        const payload = req.body.xml;
        wechaty_puppet_1.log.verbose('Webhook', 'appPost({url: %s} with payload: %s', req.url, JSON.stringify(payload));
        const knownTypeList = [
            'text',
            'image',
        ];
        this.userOpen[payload.FromUserName] = true;
        /**
         * TODO: support more MsgType
         */
        if (knownTypeList.includes(payload.MsgType)) {
            this.emit('message', payload);
        }
        /**
         * 假如服务器无法保证在五秒内处理并回复，必须做出下述回复，这样微信服务器才不会对此作任何处理，
         * 并且不会发起重试（这种情况下，可以使用客服消息接口进行异步回复），否则，将出现严重的错误提示。
         *  1、直接回复success（推荐方式）
         *  2、直接回复空串（指字节长度为0的空字符串，而不是XML结构体中content字段的内容为空）
         *
         *  https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Passive_user_reply_message.html
         */
        if (this.personalMode) {
            let reply = null;
            const timeout = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
            for (let i = 0; i < (4000 / 5); i++) {
                await timeout(5);
                if (this.messageCache[payload.FromUserName]) {
                    const msg = this.messageCache[payload.FromUserName];
                    this.messageCache[payload.FromUserName] = undefined;
                    if (msg.msgtype === 'text') {
                        reply = `<xml>
              <ToUserName><![CDATA[${payload.FromUserName}]]></ToUserName>
              <FromUserName><![CDATA[${payload.ToUserName}]]></FromUserName>
              <CreateTime>${payload.CreateTime}</CreateTime>
              <MsgType><![CDATA[text]]></MsgType>
              <Content><![CDATA[${msg.content}]]></Content>
            </xml>
            `;
                    }
                    break;
                }
            }
            if (reply) {
                this.userOpen[payload.FromUserName] = undefined;
                return res.end(reply);
            }
        }
        this.userOpen[payload.FromUserName] = undefined;
        res.end('success');
    }
}
exports.Webhook = Webhook;
//# sourceMappingURL=webhook.js.map