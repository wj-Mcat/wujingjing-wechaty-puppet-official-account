declare function textMessagePayload(args: {
    fromUserName: string;
    toUserName: string;
    content: string;
}): string;
declare function imageMessagePayload(args: {
    toUserName: string;
    fromUserName: string;
    mediaId: string;
}): string;
export { textMessagePayload, imageMessagePayload, };
//# sourceMappingURL=payload-builder.d.ts.map