#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tstest_1 = require("tstest");
const wechaty_1 = require("wechaty");
const mod_1 = require("../src/mod");
const oa_options_1 = require("./fixtures/oa-options");
const isPR = require('is-pr');
tstest_1.test('integration testing', async (t) => {
    if (isPR) {
        t.skip('Skip for PR');
        return;
    }
    const puppet = new mod_1.PuppetOA({
        ...oa_options_1.getOaOptions(),
    });
    const wechaty = new wechaty_1.Wechaty({ puppet });
    t.ok(wechaty, 'should instantiate wechaty with puppet official account');
});
tstest_1.test('PuppetOA perfect restart testing', async (t) => {
    if (isPR) {
        t.skip('Skip for PR');
        return;
    }
    const puppet = new mod_1.PuppetOA({
        ...oa_options_1.getOaOptions(),
        port: 0,
        webhookProxyUrl: undefined,
    });
    try {
        for (let i = 0; i < 3; i++) {
            await puppet.start();
            t.true(puppet.state.on());
            await puppet.stop();
            t.true(puppet.state.off());
            t.pass('start/stop-ed at #' + i);
        }
        t.pass('PuppetOA() perfect restart pass.');
    }
    catch (e) {
        t.fail(e);
    }
});
//# sourceMappingURL=integration.spec.js.map