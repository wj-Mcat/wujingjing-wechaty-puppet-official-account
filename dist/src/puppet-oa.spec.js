#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blue_tape_1 = __importDefault(require("blue-tape"));
const oa_options_1 = require("../tests/fixtures/oa-options");
const puppet_oa_1 = require("./puppet-oa");
class PuppetOATest extends puppet_oa_1.PuppetOA {
}
blue_tape_1.default('tbw', async (t) => {
    const oa = new PuppetOATest({
        ...oa_options_1.getOaOptions(),
    });
    t.ok(oa, 'should be ok');
});
//# sourceMappingURL=puppet-oa.spec.js.map