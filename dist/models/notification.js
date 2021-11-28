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
const mongoose_1 = __importStar(require("mongoose"));
const creator_1 = __importDefault(require("../models/schemas/creator"));
const schema = new mongoose_1.Schema({
    creators: [creator_1.default],
    subscriber: {
        id: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    },
    type: { type: String, trim: true, maxLength: 100, required: true },
    date: { type: Date, default: Date.now },
    phrase: { type: String, trim: true, maxLength: 100, required: true },
    payload: { type: String, trim: true, maxLength: 100 },
});
exports.default = mongoose_1.default.model("Notification", schema);
