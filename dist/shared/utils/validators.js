"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSubPostType = exports.validateReactionType = exports.validateIdWithJoi = void 0;
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
