"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.default = new mongoose_1.Schema({
    original: {
        url: { type: String, trim: true },
        dUrl: { type: String, trim: true },
    },
    thumbnail: {
        url: { type: String, trim: true },
        dUrl: { type: String, trim: true },
    },
}, { _id: false });
