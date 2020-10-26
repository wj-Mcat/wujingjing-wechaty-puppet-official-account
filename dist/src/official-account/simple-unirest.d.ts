/// <reference types="node" />
export interface FileInfo {
    contentType?: string;
    filename: string;
    knownLength: number;
}
declare type RequestType = 'json' | 'html';
interface UnirestRequest<T> extends Promise<{
    body: T;
}> {
    attach: (formName: string, buf: Buffer, info?: FileInfo) => UnirestRequest<T>;
    type: (t: RequestType) => UnirestRequest<T>;
    field: (payload: Object) => UnirestRequest<T>;
    send: (payload: Object | Buffer | string) => UnirestRequest<T>;
    end: (resolve: (result: any) => void) => UnirestRequest<T>;
}
export interface SimpleUnirest {
    get: <T = unknown>(url: string) => UnirestRequest<T>;
    post: <T = unknown>(url: string) => UnirestRequest<T>;
}
declare function getSimpleUnirest(endpoint: string): SimpleUnirest;
export { getSimpleUnirest };
//# sourceMappingURL=simple-unirest.d.ts.map