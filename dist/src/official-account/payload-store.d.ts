import { FlashStore } from 'flash-store';
import LRU from 'lru-cache';
import { OAMessagePayload, OAContactPayload } from './schema';
declare class PayloadStore {
    protected cacheOAContactPayload?: FlashStore<OAContactPayload>;
    protected cacheOAMessagePayload?: LRU<string, OAMessagePayload>;
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    getMessagePayload(id: string): Promise<undefined | OAMessagePayload>;
    setMessagePayload(id: string, payload: OAMessagePayload): Promise<void>;
    getContactPayload(id: string): Promise<undefined | OAContactPayload>;
    setContactPayload(id: string, payload: OAContactPayload): Promise<void>;
}
export { PayloadStore };
//# sourceMappingURL=payload-store.d.ts.map