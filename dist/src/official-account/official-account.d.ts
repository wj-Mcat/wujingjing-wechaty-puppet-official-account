/// <reference types="node" />
import { EventEmitter } from 'events';
import { FileBox } from 'wechaty-puppet';
import { Webhook, VerifyArgs } from './webhook';
import { PayloadStore } from './payload-store';
import { SimpleUnirest } from './simple-unirest';
import { OAMessageType, OAMediaType, ErrorPayload, OAContactPayload } from './schema';
export interface OfficialAccountOptions {
    appId: string;
    appSecret: string;
    port?: number;
    token: string;
    webhookProxyUrl?: string;
    personalMode?: boolean;
}
export interface AccessTokenPayload {
    expiresIn: number;
    timestamp: number;
    token: string;
}
declare type StopperFn = () => void;
declare class OfficialAccount extends EventEmitter {
    options: OfficialAccountOptions;
    payloadStore: PayloadStore;
    protected webhook: Webhook;
    protected simpleUnirest: SimpleUnirest;
    protected accessTokenPayload?: AccessTokenPayload;
    protected stopperFnList: StopperFn[];
    get accessToken(): string;
    constructor(options: OfficialAccountOptions);
    verify(args: VerifyArgs): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    protected updateAccessToken(): Promise<boolean>;
    /**
     *  https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
     */
    protected startSyncingAccessToken(): Promise<StopperFn>;
    sendCustomMessagePersonal(args: {
        touser: string;
        msgtype: OAMessageType;
        content: string;
    }): Promise<void>;
    /**
     * 客服接口-发消息
     *  https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Service_Center_messages.html#7
     */
    sendCustomMessage(args: {
        touser: string;
        msgtype: OAMessageType;
        content: string;
    }): Promise<ErrorPayload>;
    sendFile(args: {
        file: FileBox;
        touser: string;
        msgtype: OAMediaType;
    }): Promise<void>;
    getContactList(): Promise<string[]>;
    getContactPayload(openId: string): Promise<void | OAContactPayload>;
    updateContactRemark(openId: string, remark: string): Promise<void>;
}
export { OfficialAccount };
//# sourceMappingURL=official-account.d.ts.map