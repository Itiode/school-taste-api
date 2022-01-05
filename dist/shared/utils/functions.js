"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isADayOld = exports.getNotificationPayload = exports.formatDate = void 0;
const moment_1 = __importDefault(require("moment"));
function formatDate(date) {
    return (0, moment_1.default)(date).fromNow();
}
exports.formatDate = formatDate;
function getNotificationPayload(payload) {
    return payload.length > 100 ? `${payload.slice(0, 97)}...` : payload;
}
exports.getNotificationPayload = getNotificationPayload;
function isADayOld(date) {
    const currentDate = new Date();
}
exports.isADayOld = isADayOld;
