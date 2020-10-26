"use strict";
/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppetOA = void 0;
const wechaty_puppet_1 = require("wechaty-puppet");
const version_1 = require("./version");
const config_1 = require("./config");
const official_account_1 = require("./official-account/official-account");
class PuppetOA extends wechaty_puppet_1.Puppet {
    constructor(options = {}) {
        super();
        wechaty_puppet_1.log.verbose('PuppetOA', 'constructor()');
        options = {
            ...config_1.envOptions(),
            ...options,
        };
        if (options.appId) {
            this.appId = options.appId;
        }
        else {
            throw new Error(`
        PuppetOA: appId not found. Please either set the WECHATY_PUPPET_OA_APP_ID environment variable, or set 'appId' optoins for PuppetOA.
      `);
        }
        if (options.appSecret) {
            this.appSecret = options.appSecret;
        }
        else {
            throw new Error(`
        PuppetOA: appSecret not found. Please either set the WECHATY_PUPPET_OA_APP_SECRET environment variable, or set 'appSecret' options for PuppetOA.
      `);
        }
        if (options.token) {
            this.token = options.token;
        }
        else {
            throw new Error(`
        PuppetOA: token not found. Please either set WECHATY_PUPPET_OA_TOKEN environment variabnle, or set 'token' options for PuppetOA.
      `);
        }
        if (options.personalMode) {
            this.personalMode = options.personalMode;
        }
        else {
            this.personalMode = false;
        }
        this.port = options.port;
        this.webhookProxyUrl = options.webhookProxyUrl;
    }
    contactPhone(contactId, phoneList) {
        wechaty_puppet_1.log.info('contactPhone(%s, %s)', contactId, phoneList);
        throw new Error('Method not implemented.');
    }
    contactCorporationRemark(contactId, corporationRemark) {
        wechaty_puppet_1.log.info('contactCorporationRemark(%s, %s)', contactId, corporationRemark);
        throw new Error('Method not implemented.');
    }
    contactDescription(contactId, description) {
        wechaty_puppet_1.log.info('contactDescription(%s, %s)', contactId, description);
        throw new Error('Method not implemented.');
    }
    async start() {
        wechaty_puppet_1.log.verbose('PuppetOA', 'start()');
        if (this.state.on()) {
            wechaty_puppet_1.log.warn('PuppetOA', 'start() is called on a ON puppet. await ready(on) and return.');
            await this.state.ready('on');
            return;
        }
        try {
            this.state.on('pending');
            const oa = new official_account_1.OfficialAccount({
                appId: this.appId,
                appSecret: this.appSecret,
                personalMode: this.personalMode,
                port: this.port,
                token: this.token,
                webhookProxyUrl: this.webhookProxyUrl,
            });
            this.bridgeEvents(oa);
            await oa.start();
            this.oa = oa;
            // FIXME: Huan(202008) find a way to get the bot user information
            this.id = 'wechaty-puppet-official-account';
            await this.oa.payloadStore.setContactPayload(this.id, {});
            this.state.on(true);
        }
        catch (e) {
            wechaty_puppet_1.log.error('PuppetOA', 'start() rejection: %s', e);
            this.state.off(true);
        }
    }
    bridgeEvents(oa) {
        oa.on('message', msg => this.emit('message', { messageId: msg.MsgId }));
    }
    async stop() {
        wechaty_puppet_1.log.verbose('PuppetOA', 'stop()');
        if (this.state.off()) {
            wechaty_puppet_1.log.warn('PuppetOA', 'stop() is called on a OFF puppet. await ready(off) and return.');
            await this.state.ready('off');
            return;
        }
        try {
            this.state.off('pending');
            if (this.oa) {
                this.oa.removeAllListeners();
                await this.oa.stop();
                this.oa = undefined;
            }
        }
        finally {
            this.state.off(true);
        }
    }
    login(contactId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'login()');
        return super.login(contactId);
    }
    async logout() {
        wechaty_puppet_1.log.verbose('PuppetOA', 'logout()');
        if (!this.id) {
            throw new Error('logout before login?');
        }
        this.emit('logout', { contactId: this.id, data: 'test' }); // before we will throw above by logonoff() when this.user===undefined
        this.id = undefined;
        // TODO: do the logout job
    }
    ding(data) {
        wechaty_puppet_1.log.silly('PuppetOA', 'ding(%s)', data || '');
        setTimeout(() => this.emit('dong', { data: data || '' }), 1000);
    }
    unref() {
        wechaty_puppet_1.log.verbose('PuppetOA', 'unref()');
        super.unref();
    }
    /**
     *
     * ContactSelf
     *
     *
     */
    async contactSelfQRCode() {
        wechaty_puppet_1.log.verbose('PuppetOA', 'contactSelfQRCode()');
        return 'qrcode in the future ;^)';
    }
    async contactSelfName(name) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'contactSelfName(%s)', name);
    }
    async contactSelfSignature(signature) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'contactSelfSignature(%s)', signature);
    }
    async contactAlias(contactId, alias) {
        var _a;
        wechaty_puppet_1.log.verbose('PuppetOA', 'contactAlias(%s, %s)', contactId, alias);
        /**
         * 1. set
         */
        if (alias) {
            await ((_a = this.oa) === null || _a === void 0 ? void 0 : _a.updateContactRemark(contactId, alias));
            return alias;
        }
        /**
         * 2. get
         */
        const contactPayload = await this.contactPayload(contactId);
        if (!contactPayload.alias) {
            wechaty_puppet_1.log.warn('Contact<%s> has no alias', contactId);
        }
        return contactPayload.alias;
    }
    async contactList() {
        var _a;
        wechaty_puppet_1.log.verbose('PuppetOA', 'contactList()');
        const contactIdList = await ((_a = this.oa) === null || _a === void 0 ? void 0 : _a.getContactList());
        if (!contactIdList) {
            throw new Error('contactIdList found from oa store');
        }
        return contactIdList;
    }
    async contactQRCode(contactId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'contactQRCode(%s)', contactId);
        if (contactId !== this.selfId()) {
            throw new Error('can not set avatar for others');
        }
        throw new Error('not supported');
        // return await this.bridge.WXqr
    }
    async contactAvatar(contactId, file) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'contactAvatar(%s)', contactId);
        /**
         * 1. set
         */
        if (file) {
            return;
        }
        /**
         * 2. get
         */
        const contactPayload = await this.contactPayload(contactId);
        const fileBox = wechaty_puppet_1.FileBox.fromUrl(contactPayload.avatar);
        return fileBox;
    }
    async contactRawPayloadParser(oaPayload) {
        const payload = {
            alias: oaPayload.remark,
            avatar: oaPayload.headimgurl,
            city: oaPayload.city,
            friend: true,
            gender: oaPayload.sex,
            id: oaPayload.openid,
            name: oaPayload.nickname,
            phone: [],
            province: oaPayload.province,
            signature: '',
            star: false,
            type: wechaty_puppet_1.ContactType.Individual,
            weixin: oaPayload.unionid,
        };
        return payload;
    }
    async contactRawPayload(id) {
        var _a;
        wechaty_puppet_1.log.verbose('PuppetOA', 'contactRawPayload(%s)', id);
        const contactInfoPayload = await ((_a = this.oa) === null || _a === void 0 ? void 0 : _a.getContactPayload(id));
        if (!contactInfoPayload) {
            throw new Error(`can not get ContactPayload(${id})`);
        }
        return contactInfoPayload;
    }
    /**
     *
     * Message
     *
     */
    async messageContact(messageId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'messageContact(%s)', messageId);
        // const attachment = this.mocker.MockMessage.loadAttachment(messageId)
        // if (attachment instanceof ContactMock) {
        //   return attachment.id
        // }
        return '';
    }
    async messageImage(messageId, imageType) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'messageImage(%s, %s[%s])', messageId, imageType, wechaty_puppet_1.ImageType[imageType]);
        // const attachment = this.mocker.MockMessage.loadAttachment(messageId)
        // if (attachment instanceof FileBox) {
        //   return attachment
        // }
        return wechaty_puppet_1.FileBox.fromQRCode('fake-qrcode');
    }
    async messageRecall(messageId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'messageRecall(%s)', messageId);
        return false;
    }
    async messageFile(id) {
        // const attachment = this.mocker.MockMessage.loadAttachment(id)
        // if (attachment instanceof FileBox) {
        //   return attachment
        // }
        return wechaty_puppet_1.FileBox.fromBase64('cRH9qeL3XyVnaXJkppBuH20tf5JlcG9uFX1lL2IvdHRRRS9kMMQxOPLKNYIzQQ==', 'mock-file' + id + '.txt');
    }
    async messageUrl(messageId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'messageUrl(%s)', messageId);
        // const attachment = this.mocker.MockMessage.loadAttachment(messageId)
        // if (attachment instanceof UrlLink) {
        //   return attachment.payload
        // }
        return {
            title: 'mock title for ' + messageId,
            url: 'https://mock.url',
        };
    }
    async messageMiniProgram(messageId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'messageMiniProgram(%s)', messageId);
        // const attachment = this.mocker.MockMessage.loadAttachment(messageId)
        // if (attachment instanceof MiniProgram) {
        //   return attachment.payload
        // }
        return {
            title: 'mock title for ' + messageId,
        };
    }
    async messageRawPayloadParser(rawPayload) {
        const payload = {
            fromId: rawPayload.FromUserName,
            id: rawPayload.MsgId,
            text: rawPayload.Content,
            timestamp: parseInt(rawPayload.CreateTime),
            toId: rawPayload.ToUserName,
            type: wechaty_puppet_1.MessageType.Text,
        };
        return payload;
    }
    async messageRawPayload(id) {
        var _a;
        wechaty_puppet_1.log.verbose('PuppetOA', 'messageRawPayload(%s)', id);
        const payload = await ((_a = this.oa) === null || _a === void 0 ? void 0 : _a.payloadStore.getMessagePayload(id));
        if (!payload) {
            throw new Error('payload not found from oa store');
        }
        return payload;
    }
    async messageSend(conversationId, something) {
        var _a, _b, _c;
        wechaty_puppet_1.log.verbose('PuppetOA', 'messageSend(%s, %s)', conversationId, something);
        if (!this.id) {
            throw new Error('no this.id');
        }
        if (typeof something === 'string') {
            const payload = {
                content: something,
                msgtype: 'text',
                touser: conversationId,
            };
            if (this.personalMode) {
                await ((_a = this.oa) === null || _a === void 0 ? void 0 : _a.sendCustomMessagePersonal(payload));
            }
            else {
                await ((_b = this.oa) === null || _b === void 0 ? void 0 : _b.sendCustomMessage(payload));
            }
        }
        else if (something instanceof wechaty_puppet_1.FileBox) {
            await ((_c = this.oa) === null || _c === void 0 ? void 0 : _c.sendFile({ file: something, msgtype: 'image', touser: conversationId }));
        }
    }
    async messageSendText(conversationId, text) {
        return this.messageSend(conversationId, text);
    }
    async messageSendFile(conversationId, file) {
        return this.messageSend(conversationId, file);
    }
    async messageSendContact(conversationId, contactId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'messageSendUrl(%s, %s)', conversationId, contactId);
        // const contact = this.mocker.MockContact.load(contactId)
        // return this.messageSend(conversationId, contact)
    }
    async messageSendUrl(conversationId, urlLinkPayload) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'messageSendUrl(%s, %s)', conversationId, JSON.stringify(urlLinkPayload));
        // const url = new UrlLink(urlLinkPayload)
        // return this.messageSend(conversationId, url)
    }
    async messageSendMiniProgram(conversationId, miniProgramPayload) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'messageSendMiniProgram(%s, %s)', conversationId, JSON.stringify(miniProgramPayload));
        // const miniProgram = new MiniProgram(miniProgramPayload)
        // return this.messageSend(conversationId, miniProgram)
    }
    async messageForward(conversationId, messageId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'messageForward(%s, %s)', conversationId, messageId);
    }
    /**
     *
     * Room
     *
     */
    async roomRawPayloadParser(payload) { return payload; }
    async roomRawPayload(id) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomRawPayload(%s)', id);
        return {};
    }
    async roomList() {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomList()');
        return [];
    }
    async roomDel(roomId, contactId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomDel(%s, %s)', roomId, contactId);
    }
    async roomAvatar(roomId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomAvatar(%s)', roomId);
        const payload = await this.roomPayload(roomId);
        if (payload.avatar) {
            return wechaty_puppet_1.FileBox.fromUrl(payload.avatar);
        }
        wechaty_puppet_1.log.warn('PuppetOA', 'roomAvatar() avatar not found, use the chatie default.');
        return config_1.qrCodeForChatie();
    }
    async roomAdd(roomId, contactId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomAdd(%s, %s)', roomId, contactId);
    }
    async roomTopic(roomId, topic) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomTopic(%s, %s)', roomId, topic);
        if (typeof topic === 'undefined') {
            return 'mock room topic';
        }
        await this.dirtyPayload(wechaty_puppet_1.PayloadType.Room, roomId);
    }
    async roomCreate(contactIdList, topic) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomCreate(%s, %s)', contactIdList, topic);
        return 'mock_room_id';
    }
    async roomQuit(roomId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomQuit(%s)', roomId);
    }
    async roomQRCode(roomId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomQRCode(%s)', roomId);
        return roomId + ' mock qrcode';
    }
    async roomMemberList(roomId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomMemberList(%s)', roomId);
        return [];
    }
    async roomMemberRawPayload(roomId, contactId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomMemberRawPayload(%s, %s)', roomId, contactId);
        return {
            avatar: 'mock-avatar-data',
            id: 'xx',
            name: 'mock-name',
            roomAlias: 'yy',
        };
    }
    async roomMemberRawPayloadParser(rawPayload) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomMemberRawPayloadParser(%s)', rawPayload);
        return rawPayload;
    }
    async roomAnnounce(roomId, text) {
        if (text) {
            return;
        }
        return 'mock announcement for ' + roomId;
    }
    /**
     *
     * Room Invitation
     *
     */
    async roomInvitationAccept(roomInvitationId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomInvitationAccept(%s)', roomInvitationId);
    }
    async roomInvitationRawPayload(roomInvitationId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomInvitationRawPayload(%s)', roomInvitationId);
    }
    async roomInvitationRawPayloadParser(rawPayload) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'roomInvitationRawPayloadParser(%s)', JSON.stringify(rawPayload));
        return rawPayload;
    }
    /**
     *
     * Friendship
     *
     */
    async friendshipRawPayload(id) {
        return { id };
    }
    async friendshipRawPayloadParser(rawPayload) {
        return rawPayload;
    }
    async friendshipSearchPhone(phone) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'friendshipSearchPhone(%s)', phone);
        return null;
    }
    async friendshipSearchWeixin(weixin) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'friendshipSearchWeixin(%s)', weixin);
        return null;
    }
    async friendshipAdd(contactId, hello) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'friendshipAdd(%s, %s)', contactId, hello);
    }
    async friendshipAccept(friendshipId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'friendshipAccept(%s)', friendshipId);
    }
    /**
     *
     * Tag
     *
     */
    async tagContactAdd(tagId, contactId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'tagContactAdd(%s)', tagId, contactId);
    }
    async tagContactRemove(tagId, contactId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'tagContactRemove(%s)', tagId, contactId);
    }
    async tagContactDelete(tagId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'tagContactDelete(%s)', tagId);
    }
    async tagContactList(contactId) {
        wechaty_puppet_1.log.verbose('PuppetOA', 'tagContactList(%s)', contactId);
        return [];
    }
}
exports.PuppetOA = PuppetOA;
PuppetOA.VERSION = version_1.VERSION;
exports.default = PuppetOA;
//# sourceMappingURL=puppet-oa.js.map