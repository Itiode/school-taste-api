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
exports.viewPost = exports.reactToPost = exports.getPostImage = exports.getPosts = exports.createPost = void 0;
const config_1 = __importDefault(require("config"));
const post_1 = __importStar(require("../models/post"));
const notification_1 = __importDefault(require("../models/notification"));
const sub_post_1 = __importDefault(require("../models/sub-post"));
const user_1 = __importDefault(require("../models/user"));
const transaction_1 = __importDefault(require("../models/transaction"));
const constants_1 = require("../shared/constants");
const validators_1 = require("../shared/utils/validators");
const s3_1 = require("../shared/utils/s3");
const functions_1 = require("../shared/utils/functions");
const date_format_1 = require("../shared/utils/date-format");
const constants_2 = require("../shared/constants");
const createPost = async (req, res, next) => {
    const { error } = (0, post_1.validateCreatePostReq)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const creatorId = req["user"].id;
        const user = await user_1.default.findById(creatorId);
        if (!user)
            return res
                .status(404)
                .send({ msg: "Cant't create post, user not found" });
        const { title, body } = req.body;
        const { name, studentData, school, profileImage } = user;
        const userFullName = name.first + " " + name.last;
        const { department, faculty, level } = studentData;
        const searchText = `${title} ${name.first} ${name.last} ${school.fullName} ${school.shortName} ${department} ${faculty} ${level}`;
        const post = await new post_1.default({
            creator: {
                id: creatorId,
                name: userFullName,
            },
            title,
            body,
            school,
            studentData,
            searchText,
        }).save();
        if (req["files"]) {
            for (let i = 0; i < req["files"].length; i++) {
                const file = req["files"][i];
                // Remove the folder name (post-images), leaving just the file name
                const filename = file.key.split("/")[1];
                await new sub_post_1.default({
                    type: "Image",
                    ppid: post._id,
                    url: `${config_1.default.get("serverAddress")}api/posts/images/${filename}`,
                    dUrl: file.location,
                }).save();
            }
        }
        // Create notifications and notify departmental mates.
        const depMates = await user_1.default.find({
            "school.fullName": school.fullName,
            "studentData.faculty": faculty,
            "studentData.department": department,
            "studentData.level": level,
        }).select("_id name messagingToken profileImage");
        for (let depMate of depMates) {
            if (depMate._id.toHexString() !== creatorId) {
                const notification = new notification_1.default({
                    creators: [
                        {
                            id: creatorId,
                            name: `${name.first} ${name.last}`,
                        },
                    ],
                    subscriber: { id: depMate._id },
                    type: constants_2.postNotificationType.createdPostNotification,
                    phrase: constants_2.notificationPhrase.created,
                    contentId: post._id,
                    payload: (0, functions_1.getNotificationPayload)(post.title),
                    image: { thumbnail: { url: profileImage.original.url } },
                });
                await notification.save();
                const fcmPayload = {
                    data: { msg: "PostCreated", status: "0", picture: "" },
                };
                // firebase
                //   .messaging()
                //   .sendToDevice(user.messagingToken, fcmPayload, messagingOptions);
            }
        }
        res.status(201).send({ msg: "Post created successfully" });
    }
    catch (e) {
        next(new Error("Error in creating post: " + e));
    }
};
exports.createPost = createPost;
const getPosts = async (req, res, next) => {
    const userId = req["user"].id;
    const pageNumber = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;
    const { searchQuery } = req.query;
    try {
        const searchWords = searchQuery.split(" ");
        const schoolShortName = searchWords[0].toUpperCase();
        const remainingWords = searchWords.length == 1
            ? schoolShortName
            : searchWords.slice(1).join(" ");
        const posts = await post_1.default.find({
            $and: [
                { "school.shortName": schoolShortName },
                { $text: { $search: `${remainingWords}` } },
            ],
        })
            // .skip((pageNumber - 1) * pageSize)
            // .limit(pageSize)
            .select("-__v -searchText -tags")
            .sort({ _id: -1 });
        const modifiedPosts = [];
        for (const p of posts) {
            const subPosts = await sub_post_1.default.find({ ppid: p._id }).select("-__v -views -ppid -dUrl");
            const modifiedSubPosts = [];
            for (const sP of subPosts) {
                const sPReaction = sP.reactions.find((r) => r.userId.toHexString() === userId);
                modifiedSubPosts.push({
                    id: sP._id,
                    type: sP.type,
                    url: sP.url,
                    reaction: sPReaction ? sPReaction : { type: "", userId: "" },
                    reactionCount: sP.reactionCount ? sP.reactionCount : 0,
                    subCommentCount: sP.subCommentCount,
                    viewCount: sP.viewCount,
                });
            }
            const postReaction = p.reactions.find((r) => r.userId.toHexString() === userId);
            const modPost = {
                id: p._id,
                creator: p.creator,
                title: p.title,
                body: p.body,
                subPosts: modifiedSubPosts,
                school: p.school,
                studentData: p.studentData,
                date: p.date,
                formattedDate: (0, date_format_1.formatDate)(p.date),
                reactionCount: p.reactionCount ? p.reactionCount : 0,
                reaction: postReaction ? postReaction : { type: "", userId: "" },
                viewCount: p.viewCount,
                commentCount: p.commentCount,
            };
            modifiedPosts.push(modPost);
        }
        res.send({
            msg: "Posts fetched successfully",
            postCount: modifiedPosts.length,
            data: modifiedPosts,
        });
    }
    catch (e) {
        next(new Error("Error in getting posts: " + e));
    }
};
exports.getPosts = getPosts;
const getPostImage = async (req, res, next) => {
    try {
        const readStream = (0, s3_1.getFileFromS3)("post-images", req.params.filename);
        readStream.pipe(res);
    }
    catch (e) {
        next(new Error("Error in getting image: " + e));
    }
};
exports.getPostImage = getPostImage;
const reactToPost = async (req, res, next) => {
    try {
        const { error } = (0, post_1.validateReactToPostParams)(req.params);
        if (error)
            return res.status(400).send({ msg: error.details[0].message });
        const { reactionType } = req.body;
        const rxTypeIsValid = (0, validators_1.validateReactionType)(reactionType);
        if (!rxTypeIsValid)
            return res.status(400).send({ msg: "Invalid reaction type" });
        const reactingUserId = req["user"].id;
        const reactingUser = await user_1.default.findById(reactingUserId).select("_id name profileImage");
        if (!reactingUser)
            return res.status(404).send({ msg: "No user with the given ID" });
        const { postId } = req.params;
        const post = await post_1.default.findById(postId).select("_id reactions creator title");
        if (!post)
            return res.status(404).send({ msg: "No post with the given ID" });
        const reaction = post.reactions.find((reaction) => reaction.userId.toHexString() === reactingUserId);
        if (reaction) {
            // If the user doesn't want to react anymore
            if (reaction.type === reactionType) {
                await post_1.default.updateOne({ _id: postId }, { $pull: { reactions: { reactingUserId } } });
                await post_1.default.updateOne({ _id: postId }, { $inc: { reactionCount: -1 } });
                // If the user changes their reaction.
            }
            else {
                await post_1.default.updateOne({ _id: postId }, { $pull: { reactions: { reactingUserId } } });
                await post_1.default.updateOne({ _id: postId }, { $push: { reactions: { reactingUserId, type: reactionType } } });
            }
            return res.send({ msg: "Reacted to post successfully" });
        }
        // When the user reacts for the first time.
        await post_1.default.updateOne({ _id: postId }, { $push: { reactions: { userId: reactingUserId, type: reactionType } } });
        await post_1.default.updateOne({ _id: postId }, { $inc: { reactionCount: 1 } });
        if (reactingUserId !== post.creator.id.toHexString()) {
            const postOwner = await user_1.default.findById(post.creator.id).select("name");
            const owners = [
                {
                    id: post.creator.id,
                    name: `${postOwner.name.first} ${postOwner.name.last}`,
                },
            ];
            const creators = [
                {
                    id: reactingUserId,
                    name: `${reactingUser.name.first} ${reactingUser.name.last}`,
                },
            ];
            const notifType = constants_2.postNotificationType.reactedToPostNotification;
            const phrase = constants_2.notificationPhrase.liked;
            const payload = (0, functions_1.getNotificationPayload)(post.title);
            const image = {
                thumbnail: { url: reactingUser.profileImage.original.url },
            };
            await new notification_1.default({
                creators,
                owners,
                subscriber: { id: reactingUserId },
                type: notifType,
                phrase,
                payload,
                contentId: postId,
                image,
            }).save();
            await new notification_1.default({
                creators,
                owners,
                subscriber: { id: post.creator.id },
                type: notifType,
                phrase,
                payload,
                contentId: postId,
                image,
            }).save();
        }
        res.send({ msg: "Reacted to post successfully" });
    }
    catch (e) {
        next(new Error("Error in reacting to post: " + e));
    }
};
exports.reactToPost = reactToPost;
// TODO: Use a Transaction for this operation
const viewPost = async (req, res, next) => {
    try {
        const { error } = (0, post_1.validateViewPostReq)(req.params);
        if (error)
            return res.status(400).send({ msg: error.details[0].message });
        const userId = req["user"].id;
        const { postId } = req.params;
        const user = await user_1.default.findById(userId).select("_id");
        if (!user)
            return res.status(404).send({ msg: "No user with the given ID" });
        const post = await post_1.default.findById(postId).select("-_id views creator");
        if (!post)
            return res.status(404).send({ msg: "No post found" });
        if (!post.views.find((id) => id === userId)) {
            await post_1.default.updateOne({ _id: postId }, { $addToSet: { views: userId } });
            const updatedPost = await post_1.default.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } }, { new: true, useFindAndModify: false }).select("viewCount -_id");
            const postViewCount = updatedPost.viewCount;
            if (postViewCount % constants_1.maxViewsForRubyCredit === 0) {
                await user_1.default.updateOne({ _id: post.creator.id }, {
                    $inc: { rubies: 1 },
                });
                await new transaction_1.default({
                    receiver: post.creator.id,
                    description: constants_1.txDescription.contentCreation,
                    amount: constants_1.rubyCredit.contentCreation,
                }).save();
            }
        }
        res.send({ msg: "Post viewed successfully" });
    }
    catch (e) {
        next(new Error("Error in saving viewed post: " + e));
    }
};
exports.viewPost = viewPost;
