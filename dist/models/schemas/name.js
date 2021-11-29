"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.default = new mongoose_1.Schema({
    first: {
        type: String,
        minLength: 2,
        maxLength: 25,
        trim: true,
        required: true,
    },
    last: {
        type: String,
        minLength: 2,
        maxLength: 25,
        trim: true,
        required: true,
    },
}, { _id: false });
