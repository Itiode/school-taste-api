"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.default = new mongoose_1.Schema({
    day: {
        type: Number,
        minLength: 1,
        maxLength: 31,
        required: true,
    },
    month: {
        type: Number,
        min: 1,
        max: 12,
        required: true,
    },
    year: {
        type: Number,
        min: 1980,
        max: 2022,
        required: true,
    },
}, { _id: false });
