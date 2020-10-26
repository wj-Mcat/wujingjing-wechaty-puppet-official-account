/// <reference types="node" />
import { FileBox } from 'file-box';
import { FileInfo } from './simple-unirest';
declare const normalizeFileBox: (fileBox: FileBox) => Promise<{
    buf: Buffer;
    info: FileInfo;
}>;
export { normalizeFileBox };
//# sourceMappingURL=normalize-file-box.d.ts.map