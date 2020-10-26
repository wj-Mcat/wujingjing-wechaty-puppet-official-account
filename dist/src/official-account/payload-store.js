"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloadStore = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const wechaty_puppet_1 = require("wechaty-puppet");
const flash_store_1 = require("flash-store");
const lru_cache_1 = __importDefault(require("lru-cache"));
class PayloadStore {
    constructor() {
        wechaty_puppet_1.log.verbose('PayloadStore', 'constructor()');
    }
    async start() {
        wechaty_puppet_1.log.verbose('PayloadStore', 'start()');
        if (this.cacheOAMessagePayload) {
            throw new Error('PayloadStore should be stop() before start() again.');
        }
        /**
         * FlashStore
         */
        const baseDir = path_1.default.join(os_1.default.homedir(), '.wechaty', 'wechaty-puppet-official-account', 'flash-store-v0.20');
        if (!fs_1.default.existsSync(baseDir)) {
            fs_1.default.mkdirSync(baseDir, { recursive: true });
        }
        this.cacheOAContactPayload = new flash_store_1.FlashStore(path_1.default.join(baseDir, 'oa-contact-raw-payload'));
        /**
         * LRU
         */
        const lruOptions = {
            dispose(key, val) {
                wechaty_puppet_1.log.silly('PayloadStore', `constructor() lruOptions.dispose(${key}, ${JSON.stringify(val)})`);
            },
            max: 1000,
            maxAge: 1000 * 60 * 60,
        };
        this.cacheOAMessagePayload = new lru_cache_1.default(lruOptions);
    }
    async stop() {
        wechaty_puppet_1.log.verbose('PayloadStore', 'stop()');
        if (this.cacheOAMessagePayload) {
            this.cacheOAMessagePayload = undefined;
        }
        if (this.cacheOAContactPayload) {
            await this.cacheOAContactPayload.close();
            this.cacheOAContactPayload = undefined;
        }
    }
    async getMessagePayload(id) {
        var _a;
        wechaty_puppet_1.log.verbose('PayloadStore', 'getMessagePayload(%s)', id);
        return (_a = this.cacheOAMessagePayload) === null || _a === void 0 ? void 0 : _a.get(id);
    }
    async setMessagePayload(id, payload) {
        var _a;
        wechaty_puppet_1.log.verbose('PayloadStore', 'setMessagePayload(%s, %s)', id, JSON.stringify(payload));
        await ((_a = this.cacheOAMessagePayload) === null || _a === void 0 ? void 0 : _a.set(id, payload));
    }
    async getContactPayload(id) {
        var _a;
        wechaty_puppet_1.log.verbose('PayloadStore', 'getContactPayload(%s)', id);
        return (_a = this.cacheOAContactPayload) === null || _a === void 0 ? void 0 : _a.get(id);
    }
    async setContactPayload(id, payload) {
        var _a;
        wechaty_puppet_1.log.verbose('PayloadStore', 'setContactPayload(%s, %s)', id, JSON.stringify(payload));
        await ((_a = this.cacheOAContactPayload) === null || _a === void 0 ? void 0 : _a.set(id, payload));
    }
}
exports.PayloadStore = PayloadStore;
//# sourceMappingURL=payload-store.js.map