"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const wechaty_puppet_1 = require("wechaty-puppet");
const mod_1 = require("../src/mod");
/**
 *
 * 1. Declare your Bot!
 *
 */
const puppet = new mod_1.PuppetOA();
/**
 *
 * 2. Register event handlers for Bot
 *
 */
puppet
    .on('logout', onLogout)
    .on('login', onLogin)
    .on('scan', onScan)
    .on('error', onError)
    .on('message', onMessage);
/**
 *
 * 3. Start the bot!
 *
 */
puppet.start()
    .catch(async (e) => {
    console.error('Bot start() fail:', e);
    await puppet.stop();
    process.exit(-1);
});
/**
 *
 * 4. You are all set. ;-]
 *
 */
/**
 *
 * 5. Define Event Handler Functions for:
 *  `scan`, `login`, `logout`, `error`, and `message`
 *
 */
function onScan(payload) {
    if (payload.qrcode) {
        // Generate a QR Code online via
        // http://goqr.me/api/doc/create-qr-code/
        const qrcodeImageUrl = [
            'https://api.qrserver.com/v1/create-qr-code/?data=',
            encodeURIComponent(payload.qrcode),
        ].join('');
        console.info(`[${payload.status}] ${qrcodeImageUrl}\nScan QR Code above to log in: `);
    }
    else {
        console.info(`[${payload.status}]`);
    }
}
function onLogin(payload) {
    console.info(`${payload.contactId} login`);
    puppet.messageSendText(payload.contactId, 'Wechaty login').catch(console.error);
}
function onLogout(payload) {
    console.info(`${payload.contactId} logouted`);
}
function onError(payload) {
    console.error('Bot error:', payload.data);
    /*
    if (bot.logonoff()) {
      bot.say('Wechaty error: ' + e.message).catch(console.error)
    }
    */
}
/**
 *
 * 6. The most important handler is for:
 *    dealing with Messages.
 *
 */
async function onMessage(payload) {
    const msgPayload = await puppet.messagePayload(payload.messageId);
    console.info('onMessage:', JSON.stringify(msgPayload));
    if (/ding/i.test(msgPayload.text || '')) {
        await puppet.messageSendText(msgPayload.fromId, 'dong');
    }
    else if (/image/i.test(msgPayload.text || '')) {
        let fileBox = wechaty_puppet_1.FileBox.fromUrl("https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1116676390,2305043183&fm=26&gp=0.jpg", "ding-dong.jpg");
        if (msgPayload.fromId) {
            await puppet.messageSendFile(msgPayload.fromId, fileBox);
        }
    }
}
/**
 *
 * 7. Output the Welcome Message
 *
 */
const welcome = `
Puppet Version: ${puppet.version()}

Please wait... I'm trying to login in...

`;
console.info(welcome);
//# sourceMappingURL=ding-dong-bot.js.map