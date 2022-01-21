"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const metadata_1 = __importDefault(require("./metadata"));
exports.default = new mongoose_1.Schema({
    original: {
        url: { type: String, trim: true },
        dUrl: { type: String, trim: true },
    },
    thumbnail: {
        url: { type: String, trim: true },
        dUrl: { type: String, trim: true },
    },
    metadata: metadata_1.default,
}, { _id: false });
