"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationPayload = void 0;
function getNotificationPayload(payload) {
    return payload.length > 100 ? `${payload.slice(0, 97)}...` : payload;
}
exports.getNotificationPayload = getNotificationPayload;
