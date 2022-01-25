"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoiValidators = exports.validateSubPostType = exports.validateReactionType = exports.validateIdWithJoi = void 0;
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../constants");
// TODO: To be implemented
function validateIdWithJoi() { }
exports.validateIdWithJoi = validateIdWithJoi;
function validateReactionType(rxType) {
    const isValid = constants_1.validReactionTypes.find((t) => t === rxType);
    return isValid ? true : false;
}
exports.validateReactionType = validateReactionType;
function validateSubPostType(subPostType) {
    const isValid = constants_1.validSubPostTypes.find((t) => t === subPostType);
    return isValid ? true : false;
}
exports.validateSubPostType = validateSubPostType;
exports.JoiValidators = {
    id: joi_1.default.string().trim().pattern(new RegExp("^[0-9a-fA-F]{24}$")),
    phone: joi_1.default.string().trim().min(11).max(11).pattern(new RegExp("^[0-9]*$")),
};
