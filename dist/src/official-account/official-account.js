"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfficialAccount = void 0;
/* eslint-disable camelcase */
const events_1 = require("events");
const crypto_1 = __importDefault(require("crypto"));
const wechaty_puppet_1 = require("wechaty-puppet");
const normalize_file_box_1 = require("./normalize-file-box");
const webhook_1 = require("./webhook");
const payload_store_1 = require("./payload-store");
const simple_unirest_1 = require("./simple-unirest");
class OfficialAccount extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.options = options;
        wechaty_puppet_1.log.verbose('OfficialAccount', 'constructor(%s)', JSON.stringify(options));
        this.webhook = new webhook_1.Webhook({
            personalMode: !!this.options.personalMode,
            port: this.options.port,
            verify: this.verify.bind(this),
            webhookProxyUrl: this.options.webhookProxyUrl,
        });
        this.payloadStore = new payload_store_1.PayloadStore();
        this.simpleUnirest = simple_unirest_1.getSimpleUnirest('https://api.weixin.qq.com/cgi-bin/');
        this.stopperFnList = [];
    }
    get accessToken() {
        if (!this.accessTokenPayload) {
            throw new Error('accessToken() this.accessTokenPayload uninitialized!');
        }
        return this.accessTokenPayload.token;
    }
    verify(args) {
        wechaty_puppet_1.log.verbose('OfficialAccount', 'verify(%s)', JSON.stringify(args));
        const data = [
            args.timestamp,
            args.nonce,
            this.options.token,
        ].sort().join('');
        const digest = crypto_1.default
            .createHash('sha1')
            .update(data)
            .digest('hex');
        return digest === args.signature;
    }
    async start() {
        wechaty_puppet_1.log.verbose('OfficialAccount', 'start()');
        this.webhook.on('message', async (message) => {
            await this.payloadStore.setMessagePayload(message.MsgId, message);
            this.emit('message', message);
        });
        await this.payloadStore.start();
        const succeed = await this.updateAccessToken();
        if (!succeed) {
            wechaty_puppet_1.log.error('OfficialAccount', 'start() updateAccessToken() failed.');
        }
        const stopper = await this.startSyncingAccessToken();
        this.stopperFnList.push(stopper);
        await this.webhook.start();
    }
    async stop() {
        wechaty_puppet_1.log.verbose('OfficialAccount', 'stop()');
        while (this.stopperFnList.length > 0) {
            const stopper = this.stopperFnList.pop();
            if (stopper) {
                await stopper();
            }
        }
        if (this.webhook) {
            await this.webhook.stop();
        }
        await this.payloadStore.stop();
    }
    async updateAccessToken() {
        wechaty_puppet_1.log.verbose('OfficialAccount', 'updateAccessToken()');
        /**
         * updated: {
         *  "access_token":"3...Q",
         *  "expires_in":7200
         * }
         */
        const ret = await this.simpleUnirest
            .get(`token?grant_type=client_credential&appid=${this.options.appId}&secret=${this.options.appSecret}`);
        wechaty_puppet_1.log.verbose('OfficialAccount', 'updateAccessToken() %s', JSON.stringify(ret.body));
        if (ret.body.errcode && ret.body.errcode > 0) {
            // {"errcode":40164,"errmsg":"invalid ip 111.199.187.71 ipv6 ::ffff:111.199.187.71, not in whitelist hint: [H.BDtZFFE-Q7bNKA] rid: 5f283869-46321ea1-07d7260c"}
            wechaty_puppet_1.log.warn('OfficialAccount', `updateAccessToken() ${ret.body.errcode}: ${ret.body.errmsg}`);
            if (this.accessTokenPayload) {
                const expireTimestamp = this.accessTokenPayload.timestamp
                    + (this.accessTokenPayload.expiresIn * 1000);
                if (expireTimestamp > Date.now()) {
                    // expired.
                    wechaty_puppet_1.log.warn('OfficialAccount', 'updateAccessToken() token expired!');
                    this.accessTokenPayload = undefined;
                }
            }
            return false;
        }
        this.accessTokenPayload = {
            expiresIn: ret.body.expires_in,
            timestamp: Date.now(),
            token: ret.body.access_token,
        };
        wechaty_puppet_1.log.verbose('OfficialAccount', 'updateAccessToken() synced. New token will expiredIn %s seconds', this.accessTokenPayload.expiresIn);
        return true;
    }
    /**
     *  https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
     */
    async startSyncingAccessToken() {
        wechaty_puppet_1.log.verbose('OfficialAccount', 'startSyncingAccessToken()');
        const marginSeconds = 5 * 60; // 5 minutes
        const tryAgainSeconds = 60; // 1 minute
        let timer;
        const update = () => this.updateAccessToken()
            .then(succeed => succeed
            ? this.accessTokenPayload.expiresIn - marginSeconds
            : tryAgainSeconds)
            .then(seconds => setTimeout(update, seconds * 1000))
            // eslint-disable-next-line no-return-assign
            .then(newTimer => timer = newTimer)
            .catch(e => wechaty_puppet_1.log.error('OfficialAccount', 'startSyncingAccessToken() update() rejection: %s', e));
        if (!this.accessTokenPayload) {
            await update();
        }
        else {
            const seconds = this.accessTokenPayload.expiresIn - marginSeconds;
            timer = setTimeout(update, seconds * 1000);
        }
        return () => timer && clearTimeout(timer);
    }
    async sendCustomMessagePersonal(args) {
        this.webhook.emit('instantReply', args);
    }
    /**
     * 客服接口-发消息
     *  https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Service_Center_messages.html#7
     */
    async sendCustomMessage(args) {
        wechaty_puppet_1.log.verbose('OfficialAccount', 'sendCustomMessage(%s)', JSON.stringify(args));
        const ret = await this.simpleUnirest
            .post(`message/custom/send?access_token=${this.accessToken}`)
            .type('json')
            .send({
            msgtype: args.msgtype,
            text: {
                content: args.content,
            },
            touser: args.touser,
        });
        /**
         * { errcode: 0, errmsg: 'ok' }
         */
        /**
         * TODO(huan) 202008: deal with this situation
         * {
            errcode: 45015,
            errmsg: 'response out of time limit or subscription is canceled hint: [CgCD2CMre-brVPIA] rid: 5f2b8ff1-4943a9b3-70b9fe5e'
          }
         */
        return ret.body;
    }
    async sendFile(args) {
        wechaty_puppet_1.log.verbose('OfficialAccount', 'sendFile(%s)', JSON.stringify(args));
        const { buf, info } = await normalize_file_box_1.normalizeFileBox(args.file);
        const mediaResponse = await this.simpleUnirest.post(`media/upload?access_token=${this.accessToken}&type=${args.msgtype}`).attach('attachments[]', buf, info);
        // the type of result is string
        if (typeof mediaResponse.body === 'string') {
            mediaResponse.body = JSON.parse(mediaResponse.body);
        }
        const data = {
            image: {
                media_id: mediaResponse.body.media_id,
            },
            msgtype: args.msgtype,
            touser: args.touser,
        };
        const messageResponse = await this.simpleUnirest.post(`message/custom/send?access_token=${this.accessToken}`).type('json').send(data);
        if (messageResponse.body.errcode) {
            wechaty_puppet_1.log.error('OfficialAccount', 'SendFile() can not send file to wechat user .');
        }
    }
    async getContactList() {
        wechaty_puppet_1.log.verbose('OfficialAccount', 'getContactList');
        let openIdList = [];
        let nextOpenId = '';
        while (true) {
            const req = await this.simpleUnirest.get(`user/get?access_token=${this.accessToken}&next_openid=${nextOpenId}`);
            if (req.body.errcode) {
                wechaty_puppet_1.log.error(`OfficialAccount', 'getContactList() ${req.body.errmsg}`);
                return openIdList;
            }
            if (!req.body.next_openid) {
                break;
            }
            openIdList = openIdList.concat(req.body.data.openid);
            nextOpenId = req.body.next_openid;
        }
        return openIdList;
    }
    async getContactPayload(openId) {
        wechaty_puppet_1.log.verbose('OfficialAccount', 'getContactPayload(%s)', openId);
        if (openId && openId.startsWith('gh_')) {
            // wechaty load the SelfContact object, so just return it.
            /* eslint-disable sort-keys */
            const selfContactPayload = {
                subscribe: 0,
                openid: openId,
                nickname: 'from official-account options ?',
                sex: wechaty_puppet_1.ContactGender.Unknown,
                language: 'zh_CN',
                city: '北京',
                province: '北京',
                country: '中国',
                headimgurl: '',
                subscribe_time: 0,
                unionid: '0',
                remark: '微信公众号客服',
                groupid: 0,
                tagid_list: [],
                subscribe_scene: '',
                qr_scene: 0,
                qr_scene_str: '',
            };
            return selfContactPayload;
        }
        const res = await this.simpleUnirest.get(`user/info?access_token=${this.accessToken}&openid=${openId}&lang=zh_CN`);
        if (res.body.errcode) {
            wechaty_puppet_1.log.error(`OfficialAccount', 'getContactPayload() ${res.body.errmsg}`);
            return;
        }
        // const payload: ContactPayload = {
        //   alias     : res.body.remark,
        //   avatar    : res.body.headimgurl,
        //   city      : res.body.city,
        //   friend    : true,
        //   gender    : res.body.sex,
        //   id        : res.body.openid,
        //   name      : res.body.nickname,
        //   province  : res.body.province,
        //   signature : '',
        //   star      : false,
        //   type      : ContactType.Individual,
        //   weixin    : res.body.unionid,
        // }
        /*
        * wj-Mcat: What kind of the ContactType should be ?
        * TODO -> there are some data can be feed into ContactPayload
        */
        return res.body;
    }
    async updateContactRemark(openId, remark) {
        wechaty_puppet_1.log.verbose('OfficialAccount', 'setContactRemark(%s)', JSON.stringify({ openId, remark }));
        const res = await this.simpleUnirest.post(`user/info/updateremark?access_token=${this.accessToken}`);
        if (res.body.errcode) {
            wechaty_puppet_1.log.error('OfficialAccount', 'setContactRemark() can update contact remark (%s)', res.body.errmsg);
        }
    }
}
exports.OfficialAccount = OfficialAccount;
//# sourceMappingURL=official-account.js.map