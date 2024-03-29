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
exports.validateReactToPostCommentParams = exports.validateAddPostCommentData = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const reaction_1 = __importDefault(require("../schemas/reaction"));
const schema = new mongoose_1.Schema({
    text: {
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 1000,
        required: true,
    },
    postId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Post" },
    creator: {
        id: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    },
    date: { type: Date, default: Date.now },
    reactions: [reaction_1.default],
    reactionCount: Number,
});
exports.default = mongoose_1.default.model("Post-Comment", schema);
function validateAddPostCommentData(data) {
    return joi_1.default.object({
        text: joi_1.default.string().trim().min(1).max(1000).required(),
        postId: joi_1.default.string()
            .trim()
            .regex(new RegExp("^[0-9a-fA-F]{24}$"))
            .required(),
    }).validate(data);
}
exports.validateAddPostCommentData = validateAddPostCommentData;
function validateReactToPostCommentParams(data) {
    return joi_1.default.object({
        commentId: joi_1.default.string()
            .trim()
            .regex(new RegExp("^[0-9a-fA-F]{24}$"))
            .required(),
    }).validate(data);
}
exports.validateReactToPostCommentParams = validateReactToPostCommentParams;
