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
exports.getSubPostComments = exports.reactToSubPostComment = exports.addSubPostComment = void 0;
const sub_post_comment_1 = __importStar(require("../../models/comment/sub-post-comment"));
const sub_post_1 = __importDefault(require("../../models/sub-post"));
const user_1 = __importDefault(require("../../models/user"));
const validators_1 = require("../../shared/utils/validators");
const functions_1 = require("../../shared/utils/functions");
const addSubPostComment = async (req, res, next) => {
    const { error } = (0, sub_post_comment_1.validateAddSubPostCommentData)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const userId = req["user"].id;
        const { text, subPostId } = req.body;
        const subPost = await sub_post_1.default.findById(subPostId).select("_id");
        if (!subPost)
            return res.status(404).send({ msg: "No sub post with the given ID" });
        const user = await user_1.default.findById(userId).select("name profileImage");
        if (!user)
            return res.status(404).send({ msg: "No user with the given ID" });
        const comment = await new sub_post_comment_1.default({
            text,
            subPostId,
            creator: {
                id: userId,
            },
        }).save();
        // Include name and imageUrl so they can be used
        // to create a comment for the comment list in the frontend.
        const transformedC = {
            id: comment._id,
            text: comment.text,
            creator: {
                id: comment.creator.id,
                name: `${user.name.first} ${user.name.last}`,
                imageUrl: user.profileImage.original.url,
            },
            subPostId: comment.subPostId,
            date: comment.date,
            formattedDate: (0, functions_1.formatDate)(comment.date.toISOString()),
            reactionCount: 0,
            reaction: { type: "", userId: "" },
        };
        await sub_post_1.default.updateOne({ _id: subPostId }, { $inc: { commentCount: 1 } });
        res
            .status(201)
            .send({ msg: "Sub post comment added successfully", data: transformedC });
    }
    catch (e) {
        next(new Error("Error in adding sub post comment: " + e));
    }
};
exports.addSubPostComment = addSubPostComment;
const reactToSubPostComment = async (req, res, next) => {
    const { error } = (0, sub_post_comment_1.validateReactToSubPostCommentParams)(req.params);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const { reactionType } = req.body;
        const rxTypeIsValid = (0, validators_1.validateReactionType)(reactionType);
        if (!rxTypeIsValid)
            return res.status(400).send({ msg: "Invalid reaction type" });
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId).select("_id");
        if (!user)
            return res.status(404).send({ msg: "No user with the given ID" });
        const { commentId } = req.params;
        const subComment = await sub_post_comment_1.default.findById(commentId);
        if (!subComment)
            return res
                .status(404)
                .send({ msg: "No sub post comment with the given ID" });
        const reaction = subComment.reactions.find((reaction) => reaction.userId.toHexString() === userId);
        if (reaction) {
            // If the user doesn't want to react anymore
            if (reaction.type === reactionType) {
                await sub_post_comment_1.default.updateOne({ _id: commentId }, { $pull: { reactions: { userId } } });
                await sub_post_comment_1.default.updateOne({ _id: commentId }, { $inc: { reactionCount: -1 } });
                // If the user changes their reaction.
            }
            else {
                await sub_post_comment_1.default.updateOne({ _id: commentId }, { $pull: { reactions: { userId } } });
                await sub_post_comment_1.default.updateOne({ _id: commentId }, { $push: { reactions: { userId, type: reactionType } } });
            }
            return res.send({ msg: "Reacted to sub post comment successfully" });
        }
        // When the user reacts for the first time.
        await sub_post_comment_1.default.updateOne({ _id: commentId }, { $push: { reactions: { userId, type: reactionType } } });
        await sub_post_comment_1.default.updateOne({ _id: commentId }, { $inc: { reactionCount: 1 } });
        res.send({ msg: "Reacted to sub post comment successfully" });
    }
    catch (e) {
        next(new Error("Error in reacting to sub post comment: " + e));
    }
};
exports.reactToSubPostComment = reactToSubPostComment;
const getSubPostComments = async (req, res, next) => {
    try {
        const userId = req["user"].id;
        const pageNumber = +req.query.pageNumber;
        const pageSize = +req.query.pageSize;
        const comments = await sub_post_comment_1.default.find({
            subPostId: req.params.subPostId,
        })
            // .skip((pageNumber - 1) * pageSize)
            // .limit(pageSize)
            .select("-__v")
            .sort({ _id: -1 });
        const transformedComments = comments.map((c) => {
            const reaction = c.reactions.find((r) => r.userId.toHexString() === userId);
            return {
                id: c._id,
                text: c.text,
                creator: c.creator,
                subPostId: c.subPostId,
                date: c.date,
                formattedDate: (0, functions_1.formatDate)(c.date.toString()),
                reactionCount: c.reactionCount ? c.reactionCount : 0,
                reaction: reaction ? reaction : { type: "", userId: "" },
            };
        });
        res.send({
            msg: "Sub post comments gotten successfully",
            commentCount: transformedComments.length,
            data: transformedComments,
        });
    }
    catch (e) {
        next(new Error("Error in getting sub post comments: " + e));
    }
};
exports.getSubPostComments = getSubPostComments;
