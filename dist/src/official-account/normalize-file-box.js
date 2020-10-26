"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeFileBox = void 0;
const file_box_1 = require("file-box");
const wechaty_1 = require("wechaty");
const normalizeFileBox = async (fileBox) => {
    wechaty_1.log.verbose('WechatyPluginFreshdesk', 'normalizeFileBox({type: "%s", name: "%s"})', file_box_1.FileBoxType[fileBox.type()], fileBox.name);
    const buf = await fileBox.toBuffer();
    const length = buf.byteLength;
    const info = {
        contentType: fileBox.mimeType,
        filename: fileBox.name.trim(),
        knownLength: length,
    };
    return {
        buf,
        info,
    };
};
exports.normalizeFileBox = normalizeFileBox;
//# sourceMappingURL=normalize-file-box.js.map