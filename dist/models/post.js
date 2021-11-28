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
exports.validateViewPostReq = exports.validateReactToPostParams = exports.validateCreatePostReq = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const reaction_1 = __importDefault(require("./schemas/reaction"));
const schema = new mongoose_1.Schema({
    creator: {
        id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, trim: true, maxLength: 250, required: true },
    },
    title: {
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 100,
        required: true,
    },
    body: { type: String, trim: true, maxLength: 5000 },
    school: {
        fullName: { type: String, trim: true, maxLength: 250, required: true },
        shortName: {
            type: String,
            trim: true,
            uppercase: true,
            maxLength: 25,
            required: true,
        },
    },
    studentData: {
        department: { type: String, trim: true, maxLength: 250, required: true },
        faculty: { type: String, trim: true, maxLength: 250, required: true },
        level: {
            type: String,
            trim: true,
            minLength: 3,
            maxLength: 3,
            required: true,
        },
    },
    searchText: { type: String, trim: true, maxLength: 500, required: true },
    tags: { type: [String] },
    date: { type: Date, default: Date.now },
    reactions: [reaction_1.default],
    reactionCount: Number,
    views: [String],
    viewCount: Number,
    commentCount: Number,
});
exports.default = mongoose_1.default.model("Post", schema);
function validateCreatePostReq(data) {
    return joi_1.default.object({
        title: joi_1.default.string().trim().max(100).required(),
        body: joi_1.default.string().trim().max(5000),
    }).validate(data);
}
exports.validateCreatePostReq = validateCreatePostReq;
function validateReactToPostParams(data) {
    return joi_1.default.object({
        postId: joi_1.default.string()
            .trim()
            .regex(new RegExp("^[0-9a-fA-F]{24}$"))
            .required(),
    }).validate(data);
}
exports.validateReactToPostParams = validateReactToPostParams;
function validateViewPostReq(data) {
    return joi_1.default.object({
        postId: joi_1.default.string()
            .trim()
            .regex(new RegExp("^[0-9a-fA-F]{24}$"))
            .required(),
    }).validate(data);
}
exports.validateViewPostReq = validateViewPostReq;
