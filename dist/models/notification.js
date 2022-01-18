"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldCreateNotif = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const creator_1 = __importDefault(require("../models/schemas/creator"));
const owner_1 = __importDefault(require("../models/schemas/owner"));
const schema = new mongoose_1.Schema({
    creators: { type: [creator_1.default], required: true },
    subscriber: {
        id: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    },
    owners: [owner_1.default],
    type: { type: String, trim: true, maxLength: 100, required: true },
    date: { type: Date, default: Date.now },
    phrase: { type: String, trim: true, maxLength: 100, required: true },
    contentId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    payload: { type: String, trim: true, maxLength: 100 },
    seen: { type: Boolean, default: false },
});
const NotificationModel = mongoose_1.default.model("Notification", schema);
const shouldCreateNotif = async (creatorId, notifType, ownerId) => {
    const notif = await NotificationModel.findOne({
        "creators.id": creatorId,
        type: notifType,
        "owners.id": ownerId,
    }).select("date");
    if (!notif)
        return true;
    const aDayInMillis = 86400000;
    const currentTime = new Date().getTime();
    const creationTime = new Date(notif.date).getTime();
    const diff = currentTime - creationTime;
    return diff > aDayInMillis;
};
exports.shouldCreateNotif = shouldCreateNotif;
exports.default = NotificationModel;
