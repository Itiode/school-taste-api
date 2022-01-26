"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.default = new mongoose_1.Schema({
    userId: mongoose_1.Schema.Types.ObjectId,
    type: {
        type: String,
        trim: true,
        enum: [
            "like",
            "love",
            "celebrate",
            "support",
            "curious",
            "sad",
            "crying",
        ],
    },
}, { _id: false });
