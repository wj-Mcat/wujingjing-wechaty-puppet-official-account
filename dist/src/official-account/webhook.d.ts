/// <reference types="node" />
import http from 'http';
import express from 'express';
import localtunnel from 'localtunnel';
import TypedEventEmitter from 'typed-emitter';
import { OAMessagePayload, OAMessageType } from './schema';
declare const WebhookEventEmitter: new () => TypedEventEmitter<{
    message: (message: OAMessagePayload) => void;
    instantReply: (message: {
        touser: string;
        msgtype: OAMessageType;
        content: string;
    }) => void;
}>;
export interface VerifyArgs {
    timestamp: string;
    nonce: string;
    signature: string;
}
interface WebhookOptions {
    personalMode?: boolean;
    port?: number;
    webhookProxyUrl?: string;
    verify: (args: VerifyArgs) => boolean;
}
declare class Webhook extends WebhookEventEmitter {
    protected options: WebhookOptions;
    protected server?: http.Server;
    protected tunnel?: localtunnel.Tunnel;
    protected personalMode?: boolean;
    protected messageCache?: any;
    protected userOpen?: any;
    readonly webhookProxyHost?: string;
    readonly webhookProxySchema?: string;
    readonly webhookProxySubDomain?: string;
    constructor(options: WebhookOptions);
    parseWebhookProxyUrl(webhookProxyUrl: string): undefined | {
        host: string;
        name: string;
        schema: string;
    };
    start(): Promise<void>;
    stop(): Promise<void>;
    setupTunnel(port: number): Promise<void>;
    appGet(req: express.Request, res: express.Response): Promise<void>;
    appPost(req: express.Request, res: express.Response): Promise<void>;
}
export { Webhook };
//# sourceMappingURL=webhook.d.ts.map