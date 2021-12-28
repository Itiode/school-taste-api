"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.default = new mongoose_1.Schema({
    original: {
        url: { type: String, trim: true, required: true },
        dUrl: { type: String, trim: true, required: true },
    },
    thumbnail: {
        url: { type: String, trim: true, required: true },
        dUrl: { type: String, trim: true, required: true },
    },
}, { _id: false });
