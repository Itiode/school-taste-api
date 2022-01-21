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
exports.getPosts = exports.validateViewPostReq = exports.validateReactToPostParams = exports.valCreatePostReqBody = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const sub_post_1 = __importDefault(require("../models/sub-post"));
const functions_1 = require("../shared/utils/functions");
const user_1 = __importDefault(require("../models/user"));
const reaction_1 = __importDefault(require("./schemas/reaction"));
const student_data_1 = __importDefault(require("./schemas/student-data"));
const schema = new mongoose_1.Schema({
    creator: {
        id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    },
    text: { type: String, trim: true, maxLength: 10000, required: true },
    studentData: { type: student_data_1.default, required: true },
    tagsString: { type: String, trim: true, required: true },
    tags: { type: [String] },
    date: { type: Date, default: Date.now },
    reactions: [reaction_1.default],
    reactionCount: Number,
    views: [String],
    viewCount: Number,
    commentCount: Number,
});
exports.default = mongoose_1.default.model("Post", schema);
function valCreatePostReqBody(data) {
    return joi_1.default.object({
        text: joi_1.default.string().trim().max(10000).required(),
    }).validate(data);
}
exports.valCreatePostReqBody = valCreatePostReqBody;
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
async function getPosts(userId, posts, res) {
    const modifiedPosts = [];
    const tempUsers = [];
    for (const p of posts) {
        const subPosts = await sub_post_1.default.find({ ppid: p._id }).select("-__v -views -dUrl");
        let tempUser;
        const isFetched = tempUsers.find((tU) => tU.id === p.creator.id);
        if (!isFetched) {
            const creator = await user_1.default.findById(p.creator.id).select("name profileImage");
            tempUser = {
                id: creator._id,
                fullName: `${creator.name.first} ${creator.name.last}`,
                userImage: creator.profileImage,
            };
            tempUsers.push(tempUser);
        }
        else {
            tempUser = tempUsers.find((tU) => tU.id === p.creator.id);
        }
        const modifiedSubPosts = [];
        for (const sP of subPosts) {
            const sPReaction = sP.reactions.find((r) => r.userId.toHexString() === userId);
            modifiedSubPosts.push({
                id: sP._id,
                type: sP.type,
                item: sP.item,
                ppid: sP.ppid,
                reaction: sPReaction ? sPReaction : { type: "", userId: "" },
                reactionCount: sP.reactionCount ? sP.reactionCount : 0,
                commentCount: sP.commentCount,
                viewCount: sP.viewCount,
            });
        }
        const postReaction = p.reactions.find((r) => r.userId.toHexString() === userId);
        const modPost = {
            id: p._id,
            creator: {
                id: tempUser.id,
                name: tempUser.fullName,
                imageUrl: tempUser.userImage.original.url,
            },
            text: p.text,
            subPosts: modifiedSubPosts,
            studentData: p.studentData,
            date: p.date,
            formattedDate: (0, functions_1.formatDate)(p.date),
            reactionCount: p.reactionCount ? p.reactionCount : 0,
            reaction: postReaction ? postReaction : { type: "", userId: "" },
            viewCount: p.viewCount,
            commentCount: p.commentCount,
        };
        modifiedPosts.push(modPost);
    }
    res.send({
        msg: "Posts gotten successfully",
        postCount: modifiedPosts.length,
        data: modifiedPosts,
    });
}
exports.getPosts = getPosts;
