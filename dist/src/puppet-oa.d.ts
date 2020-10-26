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
import { ContactPayload, FileBox, FriendshipPayload, ImageType, MessagePayload, Puppet, PuppetOptions, RoomInvitationPayload, RoomMemberPayload, RoomPayload, UrlLinkPayload, MiniProgramPayload } from 'wechaty-puppet';
import { OfficialAccountOptions, OfficialAccount } from './official-account/official-account';
import { OAContactPayload, OAMessagePayload } from './official-account/schema';
export declare type PuppetOAOptions = PuppetOptions & Partial<OfficialAccountOptions>;
declare class PuppetOA extends Puppet {
    contactPhone(contactId: string, phoneList: string[]): Promise<void>;
    contactCorporationRemark(contactId: string, corporationRemark: string | null): Promise<void>;
    contactDescription(contactId: string, description: string | null): Promise<void>;
    static readonly VERSION = "0.0.0";
    protected appId: string;
    protected appSecret: string;
    protected port?: number;
    protected token: string;
    protected webhookProxyUrl?: string;
    protected personalMode?: boolean;
    protected oa?: OfficialAccount;
    constructor(options?: PuppetOAOptions);
    start(): Promise<void>;
    protected bridgeEvents(oa: OfficialAccount): void;
    stop(): Promise<void>;
    login(contactId: string): Promise<void>;
    logout(): Promise<void>;
    ding(data?: string): void;
    unref(): void;
    /**
     *
     * ContactSelf
     *
     *
     */
    contactSelfQRCode(): Promise<string>;
    contactSelfName(name: string): Promise<void>;
    contactSelfSignature(signature: string): Promise<void>;
    /**
     *
     * Contact
     *
     */
    contactAlias(contactId: string): Promise<string>;
    contactAlias(contactId: string, alias: string | null): Promise<void>;
    contactList(): Promise<string[]>;
    contactQRCode(contactId: string): Promise<string>;
    contactAvatar(contactId: string): Promise<FileBox>;
    contactAvatar(contactId: string, file: FileBox): Promise<void>;
    contactRawPayloadParser(oaPayload: OAContactPayload): Promise<ContactPayload>;
    contactRawPayload(id: string): Promise<OAContactPayload>;
    /**
     *
     * Message
     *
     */
    messageContact(messageId: string): Promise<string>;
    messageImage(messageId: string, imageType: ImageType): Promise<FileBox>;
    messageRecall(messageId: string): Promise<boolean>;
    messageFile(id: string): Promise<FileBox>;
    messageUrl(messageId: string): Promise<UrlLinkPayload>;
    messageMiniProgram(messageId: string): Promise<MiniProgramPayload>;
    messageRawPayloadParser(rawPayload: OAMessagePayload): Promise<MessagePayload>;
    messageRawPayload(id: string): Promise<OAMessagePayload>;
    private messageSend;
    messageSendText(conversationId: string, text: string): Promise<void>;
    messageSendFile(conversationId: string, file: FileBox): Promise<void>;
    messageSendContact(conversationId: string, contactId: string): Promise<void>;
    messageSendUrl(conversationId: string, urlLinkPayload: UrlLinkPayload): Promise<void>;
    messageSendMiniProgram(conversationId: string, miniProgramPayload: MiniProgramPayload): Promise<void>;
    messageForward(conversationId: string, messageId: string): Promise<void>;
    /**
     *
     * Room
     *
     */
    roomRawPayloadParser(payload: RoomPayload): Promise<RoomPayload>;
    roomRawPayload(id: string): Promise<RoomPayload>;
    roomList(): Promise<string[]>;
    roomDel(roomId: string, contactId: string): Promise<void>;
    roomAvatar(roomId: string): Promise<FileBox>;
    roomAdd(roomId: string, contactId: string): Promise<void>;
    roomTopic(roomId: string): Promise<string>;
    roomTopic(roomId: string, topic: string): Promise<void>;
    roomCreate(contactIdList: string[], topic: string): Promise<string>;
    roomQuit(roomId: string): Promise<void>;
    roomQRCode(roomId: string): Promise<string>;
    roomMemberList(roomId: string): Promise<string[]>;
    roomMemberRawPayload(roomId: string, contactId: string): Promise<RoomMemberPayload>;
    roomMemberRawPayloadParser(rawPayload: RoomMemberPayload): Promise<RoomMemberPayload>;
    roomAnnounce(roomId: string): Promise<string>;
    roomAnnounce(roomId: string, text: string): Promise<void>;
    /**
     *
     * Room Invitation
     *
     */
    roomInvitationAccept(roomInvitationId: string): Promise<void>;
    roomInvitationRawPayload(roomInvitationId: string): Promise<any>;
    roomInvitationRawPayloadParser(rawPayload: any): Promise<RoomInvitationPayload>;
    /**
     *
     * Friendship
     *
     */
    friendshipRawPayload(id: string): Promise<any>;
    friendshipRawPayloadParser(rawPayload: any): Promise<FriendshipPayload>;
    friendshipSearchPhone(phone: string): Promise<null | string>;
    friendshipSearchWeixin(weixin: string): Promise<null | string>;
    friendshipAdd(contactId: string, hello: string): Promise<void>;
    friendshipAccept(friendshipId: string): Promise<void>;
    /**
     *
     * Tag
     *
     */
    tagContactAdd(tagId: string, contactId: string): Promise<void>;
    tagContactRemove(tagId: string, contactId: string): Promise<void>;
    tagContactDelete(tagId: string): Promise<void>;
    tagContactList(contactId?: string): Promise<string[]>;
}
export { PuppetOA };
export default PuppetOA;
//# sourceMappingURL=puppet-oa.d.ts.map