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
exports.validateReactToSubPostParams = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const reaction_1 = __importDefault(require("../models/schemas/reaction"));
const image_1 = __importDefault(require("../models/schemas/image"));
const schema = new mongoose_1.Schema({
    type: {
        type: String,
        trim: true,
        enum: ["image", "video", "gif", "sticker"],
        required: true,
    },
    ppid: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Post" },
    item: image_1.default,
    reactions: [reaction_1.default],
    reactionCount: Number,
    views: [String],
    viewCount: Number,
    commentCount: Number,
});
exports.default = mongoose_1.default.model("Sub-Post", schema);
function validateReactToSubPostParams(data) {
    return joi_1.default.object({
        subPostId: joi_1.default.string()
            .trim()
            .regex(new RegExp("^[0-9a-fA-F]{24}$"))
            .required(),
    }).validate(data);
}
exports.validateReactToSubPostParams = validateReactToSubPostParams;
