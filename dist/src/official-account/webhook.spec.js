#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blue_tape_1 = __importDefault(require("blue-tape"));
const webhook_1 = require("./webhook");
blue_tape_1.default('Webhook parseWehhookProxyUrl()', async (t) => {
    const WEBHOOK_PROXY_URL_LIST = [
        'http://wechaty-puppet-official-account.serverless.social',
        'https://fsadfasdfs421.localtunnel.chatie.io',
        'http://test.localhost.localdomain',
        'https://wechaty-puppet-official-account-4231fsdaff-312rfsdl4132fsad.localtunnel.chatie.io',
    ];
    const EXPECTED_RESULT_LIST = [
        {
            host: 'serverless.social',
            name: 'wechaty-puppet-official-account',
            schema: 'http',
        },
        {
            host: 'localtunnel.chatie.io',
            name: 'fsadfasdfs421',
            schema: 'https',
        },
        {
            host: 'localhost.localdomain',
            name: 'test',
            schema: 'http',
        },
        {
            host: 'localtunnel.chatie.io',
            name: 'wechaty-puppet-official-account-4231fsdaff-312rfsdl4132fsad',
            schema: 'https',
        },
    ];
    const webhook = new webhook_1.Webhook({
        port: 0,
        verify: (..._) => true,
    });
    const resultList = WEBHOOK_PROXY_URL_LIST.map(url => webhook.parseWebhookProxyUrl(url));
    t.deepEqual(resultList, EXPECTED_RESULT_LIST, 'should parse the webhook proxy url right');
});
//# sourceMappingURL=webhook.spec.js.map