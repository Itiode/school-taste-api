"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressImage = exports.getNotificationPayload = exports.formatDate = void 0;
const sharp_1 = __importDefault(require("sharp"));
const moment_1 = __importDefault(require("moment"));
function formatDate(date) {
    return (0, moment_1.default)(date).fromNow();
}
exports.formatDate = formatDate;
function getNotificationPayload(payload) {
    return payload.length > 100 ? `${payload.slice(0, 97)}...` : payload;
}
exports.getNotificationPayload = getNotificationPayload;
function compressImage(inputPath, filename, meta) {
    const outputPath = `public/uploads/${filename}`;
    return new Promise((resolve, reject) => {
        (0, sharp_1.default)(inputPath)
            .resize(meta.width, meta.height)
            .toFile(outputPath, (err, resizedImage) => {
            if (err) {
                reject(err);
            }
            else {
                const compImg = { ...resizedImage, name: filename, path: outputPath };
                resolve(compImg);
            }
        });
    });
}
exports.compressImage = compressImage;
