"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.default = new mongoose_1.Schema({
    day: {
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 2,
        required: true,
    },
    month: {
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 2,
        required: true,
    },
    year: {
        type: String,
        trim: true,
        minLength: 4,
        maxLength: 4,
        required: true,
    },
}, { _id: false });
