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
const addPostComment = async (req, res, next) => {
    const { error } = (0, post_comment_1.validateAddPostCommentData)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const userId = req["user"].id;
        const { text, postId } = req.body;
        const post = await post_1.default.findById(postId).select("_id creator");
        if (!post)
            return res.status(404).send({ msg: "Post not found" });
        const user = await user_1.default.findById(userId).select("name");
        const postOwner = await user_1.default.findById(post.creator.id).select("name");
        if (!user || !postOwner)
            return res.status(404).send({ msg: "User not found" });
        const comment = await new post_comment_1.default({
            text,
            postId,
            creator: {
                id: userId,
                name: `${user.name.first} ${user.name.last}`,
            },
        }).save();
        const transformedC = {
            id: comment._id,
            text: comment.text,
            creator: comment.creator,
            postId: comment.postId,
            date: comment.date,
            formattedDate: (0, functions_1.formatDate)(comment.date.toString()),
            reactionCount: comment.reactionCount ? comment.reactionCount : 0,
            reaction: { type: "", userId: "" },
        };
        await post_1.default.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });
        if (userId !== post.creator.id.toHexString()) {
            const creators = [
                {
                    id: userId,
                    name: `${user.name.first} ${user.name.last}`,
                },
            ];
            const owners = [
                {
                    id: post.creator.id,
                    name: `${postOwner.name.first} ${postOwner.name.last}`,
                },
            ];
            const phrase = constants_1.notificationPhrase.commented;
            const payload = (0, functions_1.getNotificationPayload)(text);
            await notification_1.default.insertMany([
                new notification_1.default({
                    creators,
                    owners,
                    subscriber: { id: post.creator.id },
                    contentId: post._id,
                    type: constants_1.postNotificationType.commentedOnPostNotification,
                    phrase,
                    payload,
                }),
                new notification_1.default({
                    creators,
                    owners,
                    subscriber: { id: userId },
                    contentId: post._id,
                    type: constants_1.postNotificationType.commentedOnPostNotification,
                    phrase,
                    payload,
                }),
            ]);
        }
        res
            .status(201)
            .send({ msg: "Post comment added successfully", data: transformedC });
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
            return res.status(404).send({ msg: "User not found" });
        const { commentId } = req.params;
        const comment = await post_comment_1.default.findById(commentId);
        if (!comment)
            return res.status(404).send({ msg: "Post comment not found" });
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
        const comments = await post_comment_1.default.find({
            postId: req.params.postId,
        })
            // .skip((pageNumber - 1) * pageSize)
            // .limit(pageSize)
            .select("-__v")
            .sort({ _id: -1 });
        const transformedComments = [];
        const tempUsers = [];
        for (const c of comments) {
            let tempUser;
            const isFetched = tempUsers.find((tU) => tU.id === c.creator.id);
            if (!isFetched) {
                const creator = await user_1.default.findById(c.creator.id).select("name profileImage");
                tempUser = {
                    id: creator._id,
                    fullName: `${creator.name.first} ${creator.name.last}`,
                    userImage: creator.profileImage,
                };
                tempUsers.push(tempUser);
            }
            else {
                tempUser = tempUsers.find((tU) => tU.id === c.creator.id);
            }
            const reaction = c.reactions.find((r) => r.userId.toHexString() === userId);
            transformedComments.push({
                id: c._id,
                text: c.text,
                creator: {
                    id: tempUser.id,
                    name: tempUser.fullName,
                    imageUrl: tempUser.userImage.original.url,
                },
                postId: c.postId,
                date: c.date,
                formattedDate: (0, functions_1.formatDate)(c.date.toString()),
                reactionCount: c.reactionCount ? c.reactionCount : 0,
                reaction: reaction ? reaction : { type: "", userId: "" },
            });
        }
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
