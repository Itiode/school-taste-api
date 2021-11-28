"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.default = new mongoose_1.Schema({
    id: mongoose_1.Schema.Types.ObjectId,
    name: {
        type: String,
        minLength: 2,
        maxLength: 50,
        trim: true,
        required: true,
    },
}, { _id: false });
