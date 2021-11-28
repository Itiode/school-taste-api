"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("config"));
const url = config_1.default.get('dbUrl');
exports.default = (cb) => {
    mongoose_1.default
        .connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
        .then((res) => {
        cb(res, null);
    })
        .catch((err) => {
        cb(null, err);
    });
};
