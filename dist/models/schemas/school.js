"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.default = new mongoose_1.Schema({
    id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    fullName: { type: String, trim: true, maxLength: 250, required: true },
    shortName: {
        type: String,
        trim: true,
        uppercase: true,
        maxLength: 25,
        required: true,
    },
}, { _id: false });
