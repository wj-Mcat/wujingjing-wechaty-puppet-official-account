"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envOptions = exports.qrCodeForChatie = void 0;
const wechaty_puppet_1 = require("wechaty-puppet");
const CHATIE_OFFICIAL_ACCOUNT_QRCODE = 'http://weixin.qq.com/r/qymXj7DEO_1ErfTs93y5';
function qrCodeForChatie() {
    return wechaty_puppet_1.FileBox.fromQRCode(CHATIE_OFFICIAL_ACCOUNT_QRCODE);
}
exports.qrCodeForChatie = qrCodeForChatie;
function envOptions() {
    return {
        appId: process.env.WECHATY_PUPPET_OA_APP_ID,
        appSecret: process.env.WECHATY_PUPPET_OA_APP_SECRET,
        personalMode: !!process.env.WECHATY_PUPPET_OA_PERSONAL_MODE,
        port: process.env.WECHATY_PUPPET_OA_PORT ? parseInt(process.env.WECHATY_PUPPET_OA_PORT) : undefined,
        token: process.env.WECHATY_PUPPET_OA_TOKEN,
        webhookProxyUrl: process.env.WECHATY_PUPPET_OA_WEBHOOK_PROXY_URL,
    };
}
exports.envOptions = envOptions;
//# sourceMappingURL=config.js.map