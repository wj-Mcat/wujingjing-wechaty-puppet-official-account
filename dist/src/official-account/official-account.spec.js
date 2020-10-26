#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blue_tape_1 = __importDefault(require("blue-tape"));
const cuid_1 = __importDefault(require("cuid"));
const official_account_1 = require("./official-account");
const oa_options_1 = require("../../tests/fixtures/oa-options");
const isPR = require('is-pr');
const unirest = require('unirest');
void cuid_1.default; // for testing
blue_tape_1.default('OfficialAccount smoke testing', async (t) => {
    if (isPR) {
        t.skip('Skip for PR');
        return;
    }
    const WEBHOOK_PROXY_URL = [
        'http://',
        'wechaty-puppet-official-account',
        '-',
        cuid_1.default(),
        // '.serverless.social',
        '.localtunnel.chatie.io',
    ].join('');
    const oa = new official_account_1.OfficialAccount({
        ...oa_options_1.getOaOptions(),
        webhookProxyUrl: WEBHOOK_PROXY_URL,
    });
    await oa.start();
    const future = new Promise(resolve => oa.once('message', resolve));
    const PAYLOAD = {
        Content: 'testing123',
        CreateTime: '1596436942',
        FromUserName: 'ooEEu1Pdb4otFUedqOx_LP1p8sSQ',
        MsgId: '22855481560378379',
        MsgType: 'text',
        ToUserName: 'gh_d06c5c4a0126',
    };
    const XML = `
    <xml>
    <ToUserName><![CDATA[${PAYLOAD.ToUserName}]]></ToUserName>
    <FromUserName><![CDATA[${PAYLOAD.FromUserName}]]></FromUserName>
    <CreateTime>${PAYLOAD.CreateTime}</CreateTime>
    <MsgType><![CDATA[${PAYLOAD.MsgType}]]></MsgType>
    <Content><![CDATA[${PAYLOAD.Content}]]></Content>
    </xml>
  `;
    const response = await unirest
        .post(WEBHOOK_PROXY_URL)
        // .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .type('xml')
        .send(XML);
    t.equal(response.body, 'success', 'should get success response');
    try {
        await Promise.race([
            future,
            new Promise((resolve, reject) => resolve && setTimeout(reject, 15000)),
        ]);
        t.pass('should get a message emit event from oa instance');
    }
    catch (e) {
        t.fail('should not get timeout rejection');
    }
    // await new Promise(resolve => setTimeout(resolve, 100 * 1000))
    await oa.stop();
});
blue_tape_1.default('updateAccessToken()', async (t) => {
    if (isPR) {
        t.skip('Skip for PR');
        return;
    }
    const oa = new official_account_1.OfficialAccount({
        ...oa_options_1.getOaOptions(),
        port: 0,
    });
    await oa.start();
    try {
        t.true(oa.accessToken, 'should get access token');
    }
    catch (e) {
        t.fail('should not be rejected');
    }
    await oa.stop();
});
blue_tape_1.default('sendCustomMessage()', async (t) => {
    if (isPR) {
        t.skip('Skip for PR');
        return;
    }
    const oa = new official_account_1.OfficialAccount({
        ...oa_options_1.getOaOptions(),
        port: 0,
    });
    try {
        await oa.start();
        const ret = await oa.sendCustomMessage({
            content: 'wechaty-puppet-official-account CI testing',
            msgtype: 'text',
            touser: 'ooEEu1Pdb4otFUedqOx_LP1p8sSQ',
        });
        // console.info(ret)
        t.equal(ret.errcode, 0, 'should get errcode 0');
    }
    catch (e) {
        t.fail('should not be rejected');
    }
    finally {
        await oa.stop();
    }
});
//# sourceMappingURL=official-account.spec.js.map