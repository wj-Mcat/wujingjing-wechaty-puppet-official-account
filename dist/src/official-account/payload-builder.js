"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageMessagePayload = exports.textMessagePayload = void 0;
function textMessagePayload(args) {
    const xml = [
        '<xml><ToUserName><![CDATA[' + args.toUserName + ']]></ToUserName>',
        '<FromUserName><![CDATA[' + args.fromUserName + ']]></FromUserName>',
        '<CreateTime>' + new Date().getTime() + '</CreateTime>',
        '<MsgType><![CDATA[text]]></MsgType>',
        '<Content><![CDATA[' + args.content + ']]></Content></xml>',
    ].join('');
    return xml;
}
exports.textMessagePayload = textMessagePayload;
function imageMessagePayload(args) {
    const xml = [
        '<xml><ToUserName><![CDATA[' + args.toUserName + ']]></ToUserName>',
        '<FromUserName><![CDATA[' + args.fromUserName + ']]></FromUserName>',
        '<CreateTime>' + new Date().getTime() + '</CreateTime>',
        '<MsgType><![CDATA[image]]></MsgType>',
        '<Image><MediaId><![CDATA[' + args.mediaId + ']]></MediaId></Image></xml>',
    ].join('');
    return xml;
}
exports.imageMessagePayload = imageMessagePayload;
//# sourceMappingURL=payload-builder.js.map