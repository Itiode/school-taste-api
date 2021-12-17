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
exports.getPostComments = exports.reactToPostComment = exports.addPostComment = void 0;
const post_comment_1 = __importStar(require("../../models/comment/post-comment"));
const post_1 = __importDefault(require("../../models/post"));
const user_1 = __importDefault(require("../../models/user"));
const notification_1 = __importDefault(require("../../models/notification"));
const validators_1 = require("../../shared/utils/validators");
const constants_1 = require("../../shared/constants");
const functions_1 = require("../../shared/utils/functions");
const date_format_1 = require("../../shared/utils/date-format");
const addPostComment = async (req, res, next) => {
    const { error } = (0, post_comment_1.validateAddPostCommentData)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const userId = req["user"].id;
        const { text, postId } = req.body;
        const post = await post_1.default.findById(postId).select("_id creator");
        if (!post)
            return res.status(404).send({ msg: "No post with the given ID" });
        const user = await user_1.default.findById(userId).select("name profileImage");
        const { name, profileImage } = user;
        if (!user)
            return res.status(404).send({ msg: "No user with the given ID" });
        await new post_comment_1.default({
            text,
            postId,
            creator: {
                id: userId,
                name: `${name.first} ${name.last}`,
            },
        }).save();
        await post_1.default.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });
        if (userId !== post.creator.id.toHexString()) {
            const creators = [
                {
                    id: userId,
                    name: `${name.first} ${name.last}`,
                },
            ];
            const owners = [
                {
                    id: post.creator.id,
                    name: `${user.name.first} ${user.name.last}`,
                },
            ];
            const phrase = constants_1.notificationPhrase.commented;
            const payload = (0, functions_1.getNotificationPayload)(text);
            const image = { thumbnail: { url: profileImage.original.url } };
            await new notification_1.default({
                creators,
                owners,
                subscriber: { id: post.creator.id },
                contentId: post._id,
                type: constants_1.postNotificationType.commentedOnPostNotification,
                phrase,
                payload,
                image,
            }).save();
            await new notification_1.default({
                creators,
                owners,
                subscriber: { id: userId },
                contentId: post._id,
                type: constants_1.postNotificationType.commentedOnPostNotification,
                phrase,
                payload,
                image,
            }).save();
        }
        res.status(201).send({ msg: "Post comment added successfully" });
    }
    catch (e) {
        next(new Error("Error in adding post comment: " + e));
    }
};
exports.addPostComment = addPostComment;
const reactToPostComment = async (req, res, next) => {
    const { error } = (0, post_comment_1.validateReactToPostCommentParams)(req.params);
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
        const comment = await post_comment_1.default.findById(commentId);
        if (!comment)
            return res.status(404).send({ msg: "No post comment with the given ID" });
        const reaction = comment.reactions.find((reaction) => reaction.userId.toHexString() === userId);
        if (reaction) {
            // If the user doesn't want to react anymore
            if (reaction.type === reactionType) {
                await post_comment_1.default.updateOne({ _id: commentId }, { $pull: { reactions: { userId } } });
                await post_comment_1.default.updateOne({ _id: commentId }, { $inc: { reactionCount: -1 } });
                // If the user changes their reaction.
            }
            else {
                await post_comment_1.default.updateOne({ _id: commentId }, { $pull: { reactions: { userId } } });
                await post_comment_1.default.updateOne({ _id: commentId }, { $push: { reactions: { userId, type: reactionType } } });
            }
            return res.send({ msg: "Reacted to post comment successfully" });
        }
        // When the user reacts for the first time.
        await post_comment_1.default.updateOne({ _id: commentId }, { $push: { reactions: { userId, type: reactionType } } });
        await post_comment_1.default.updateOne({ _id: commentId }, { $inc: { reactionCount: 1 } });
        res.send({ msg: "Reacted to post comment successfully" });
    }
    catch (e) {
        next(new Error("Error in reacting to post comment: " + e));
    }
};
exports.reactToPostComment = reactToPostComment;
const getPostComments = async (req, res, next) => {
    try {
        const userId = req["user"].id;
        const pageNumber = +req.query.pageNumber;
        const pageSize = +req.query.pageSize;
        const comments = await post_comment_1.default.find({ postId: req.params.postId })
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
                postId: c.postId,
                date: c.date,
                formattedDate: (0, date_format_1.formatDate)(c.date.toString()),
                reactionCount: c.reactionCount ? c.reactionCount : 0,
                reaction: reaction ? reaction : { type: "", userId: "" },
            };
        });
        res.send({
            msg: "Post comments gotten successfully",
            commentCount: transformedComments.length,
            data: transformedComments,
        });
    }
    catch (e) {
        next(new Error("Error in getting post comments: " + e));
    }
};
exports.getPostComments = getPostComments;
