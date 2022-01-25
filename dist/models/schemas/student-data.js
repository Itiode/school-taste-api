"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.default = new mongoose_1.Schema({
    school: {
        id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
        fullName: { type: String, trim: true, maxlength: 250, required: true },
        shortName: {
            type: String,
            trim: true,
            uppercase: true,
            maxlength: 25,
            required: true,
        },
    },
    faculty: {
        id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
        name: { type: String, trim: true, maxlength: 250, required: true },
    },
    department: {
        id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
        name: { type: String, trim: true, maxlength: 250, required: true },
    },
    level: {
        id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
        name: {
            type: String,
            trim: true,
            enum: [
                "100 Level",
                "200 Level",
                "300 Level",
                "400 Level",
                "500 Level",
                "600 Level",
                "ND 1",
                "ND 2",
                "HND 1",
                "HND 2",
            ],
            required: true,
        },
    },
}, { _id: false });
