"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.default = new mongoose_1.Schema({
    original: {
        width: { type: Number },
        height: { type: Number },
    },
    thumbnail: {
        width: { type: Number },
        height: { type: Number },
    },
}, { _id: false });
