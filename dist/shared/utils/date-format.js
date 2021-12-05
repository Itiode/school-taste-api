"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = void 0;
const moment_1 = __importDefault(require("moment"));
function formatDate(date) {
    return (0, moment_1.default)(date).startOf('hour').fromNow();
}
exports.formatDate = formatDate;
