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
exports.getSubComments = exports.reactToSubComment = exports.addSubComment = void 0;
const sub_comment_1 = __importStar(require("../models/sub-comment"));
const sub_post_1 = __importDefault(require("../models/sub-post"));
const user_1 = __importDefault(require("../models/user"));
const validators_1 = require("../shared/utils/validators");
const addSubComment = async (req, res, next) => {
    const { error } = (0, sub_comment_1.validateAddSubCommentData)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const userId = req["user"].id;
        const { text, subPostId } = req.body;
        const subPost = await sub_post_1.default.findById(subPostId).select("_id");
        if (!subPost)
            return res.status(404).send({ msg: "No sub post with the given ID" });
        const user = await user_1.default.findById(userId).select("name");
        if (!user)
            return res.status(404).send({ msg: "No user with the given ID" });
        await new sub_comment_1.default({
            text,
            subPostId,
            creator: {
                id: userId,
                name: `${user.name.first} ${user.name.last}`,
            },
        }).save();
        await sub_post_1.default.updateOne({ _id: subPostId }, { $inc: { subCommentCount: 1 } });
        res.status(201).send({ msg: "Sub comment added successfully" });
    }
    catch (e) {
        next(new Error("Error in adding sub comment: " + e));
    }
};
exports.addSubComment = addSubComment;
const reactToSubComment = async (req, res, next) => {
    const { error } = (0, sub_comment_1.validateReactToSubCommentParams)(req.params);
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
        const { subCommentId } = req.params;
        const subComment = await sub_comment_1.default.findById(subCommentId);
        if (!subComment)
            return res.status(404).send({ msg: "No sub comment with the given ID" });
        const reaction = subComment.reactions.find((reaction) => reaction.userId.toHexString() === userId);
        if (reaction) {
            // If the user doesn't want to react anymore
            if (reaction.type === reactionType) {
                await sub_comment_1.default.updateOne({ _id: subCommentId }, { $pull: { reactions: { userId } } });
                await sub_comment_1.default.updateOne({ _id: subCommentId }, { $inc: { reactionCount: -1 } });
                // If the user changes their reaction.
            }
            else {
                await sub_comment_1.default.updateOne({ _id: subCommentId }, { $pull: { reactions: { userId } } });
                await sub_comment_1.default.updateOne({ _id: subCommentId }, { $push: { reactions: { userId, type: reactionType } } });
            }
            return res.send({ msg: "Reacted to sub comment successfully" });
        }
        // When the user reacts for the first time.
        await sub_comment_1.default.updateOne({ _id: subCommentId }, { $push: { reactions: { userId, type: reactionType } } });
        await sub_comment_1.default.updateOne({ _id: subCommentId }, { $inc: { reactionCount: 1 } });
        res.send({ msg: "Reacted to sub comment successfully" });
    }
    catch (e) {
        next(new Error("Error in reacting to sub comment: " + e));
    }
};
exports.reactToSubComment = reactToSubComment;
const getSubComments = async (req, res, next) => {
    try {
        const userId = req["user"].id;
        const pageNumber = +req.query.pageNumber;
        const pageSize = +req.query.pageSize;
        const subComments = await sub_comment_1.default.find({
            subPostId: req.params.subPostId,
        })
            // .skip((pageNumber - 1) * pageSize)
            // .limit(pageSize)
            .select("-__v")
            .sort({ _id: -1 });
        const transformedSubComments = subComments.map((sC) => {
            const reaction = sC.reactions.find((r) => r.userId.toHexString() === userId);
            return {
                id: sC._id,
                text: sC.text,
                creator: sC.creator,
                subPostId: sC.subPostId,
                date: sC.date,
                reactionCount: sC.reactionCount ? sC.reactionCount : 0,
                reaction: reaction ? reaction : { type: "", userId: "" },
            };
        });
        res.send({
            msg: "Sub comments gotten successfully",
            subCommentCount: transformedSubComments.length,
            data: transformedSubComments,
        });
    }
    catch (e) {
        next(new Error("Error in getting sub comments: " + e));
    }
};
exports.getSubComments = getSubComments;
