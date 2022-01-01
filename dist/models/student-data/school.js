"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAddSchoolData = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const schema = new mongoose_1.Schema({
    fullName: { type: String, trim: true, maxLength: 250, required: true },
    shortName: {
        type: String,
        trim: true,
        uppercase: true,
        maxLength: 25,
        required: true,
    },
}, { timestamps: false });
exports.default = mongoose_1.default.model("School", schema);
function validateAddSchoolData(data) {
    return joi_1.default.object({
        fullName: joi_1.default.string().trim().max(250).required(),
        shortName: joi_1.default.string().trim().uppercase().max(25).required(),
    }).validate(data);
}
exports.validateAddSchoolData = validateAddSchoolData;
