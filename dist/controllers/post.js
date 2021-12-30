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
exports.viewPost = exports.reactToPost = exports.getPostImage = exports.getMyPosts = exports.getAllPosts = exports.getPost = exports.createPost = void 0;
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
const functions_2 = require("../shared/utils/functions");
const constants_2 = require("../shared/constants");
const createPost = async (req, res, next) => {
    const { error } = (0, post_1.validateCreatePostReq)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId).select("name studentData school");
        if (!user)
            return res.status(404).send({ msg: "Can't create post, user not found" });
        const { text } = req.body;
        const { name, studentData, school } = user;
        const { department, faculty, level } = studentData;
        const tagsString = `${name.first} ${name.last} ${school.fullName} ${school.shortName} ${department} ${faculty} ${level}`;
        const post = await new post_1.default({
            creator: {
                id: userId,
            },
            text,
            school,
            studentData,
            tagsString,
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
        }).select("_id name messagingToken");
        const notifs = [];
        for (let depMate of depMates) {
            if (depMate._id.toHexString() !== userId) {
                const notif = new notification_1.default({
                    creators: [
                        {
                            id: userId,
                            name: `${name.first} ${name.last}`,
                        },
                    ],
                    subscriber: { id: depMate._id },
                    type: constants_2.postNotificationType.createdPostNotification,
                    phrase: constants_2.notificationPhrase.created,
                    contentId: post._id,
                    payload: (0, functions_1.getNotificationPayload)(post.text),
                });
                notifs.push(notif);
                const fcmPayload = {
                    data: { msg: "PostCreated", status: "0", picture: "" },
                };
                // firebase
                //   .messaging()
                //   .sendToDevice(user.messagingToken, fcmPayload, messagingOptions);
            }
        }
        await notification_1.default.insertMany(notifs);
        res.status(201).send({ msg: "Post created successfully" });
    }
    catch (e) {
        next(new Error("Error in creating post: " + e));
    }
};
exports.createPost = createPost;
// TODO: Create a reusable function for creating a mod post and sub posts
const getPost = async (req, res, next) => {
    try {
        const post = await post_1.default.findById(req.params.postId).select("-__v -tagsString -tags");
        if (!post)
            res.status(404).send({ msg: "Post not found" });
        const subPosts = await sub_post_1.default.find({ ppid: post._id }).select("-__v -views -dUrl");
        const userId = req["user"].id;
        const modifiedSubPosts = [];
        for (const sP of subPosts) {
            const sPReaction = sP.reactions.find((r) => r.userId.toHexString() === userId);
            modifiedSubPosts.push({
                id: sP._id,
                type: sP.type,
                url: sP.url,
                ppid: sP.ppid,
                reaction: sPReaction ? sPReaction : { type: "", userId: "" },
                reactionCount: sP.reactionCount ? sP.reactionCount : 0,
                commentCount: sP.commentCount,
                viewCount: sP.viewCount,
            });
        }
        const postReaction = post.reactions.find((r) => r.userId.toHexString() === userId);
        const creator = await user_1.default.findById(post.creator.id).select("name profileImage");
        const modPost = {
            id: post._id,
            creator: {
                id: post.creator.id,
                name: creator.name.first + " " + creator.name.last,
                imageUrl: creator.profileImage.original.url,
            },
            text: post.text,
            subPosts: modifiedSubPosts,
            school: post.school,
            studentData: post.studentData,
            date: post.date,
            formattedDate: (0, functions_2.formatDate)(post.date),
            reactionCount: post.reactionCount ? post.reactionCount : 0,
            reaction: postReaction ? postReaction : { type: "", userId: "" },
            viewCount: post.viewCount,
            commentCount: post.commentCount,
        };
        res.send({ msg: "Post gotten successfully", data: modPost });
    }
    catch (e) {
        next(new Error("Error in getting post: " + e));
    }
};
exports.getPost = getPost;
// TODO: Create a reusable function for creating a mod post and sub posts
const getAllPosts = async (req, res, next) => {
    const userId = req["user"].id;
    const pageNumber = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;
    const { searchQuery } = req.query;
    try {
        const posts = await post_1.default.find({
            $text: { $search: `${searchQuery}` },
        })
            // .skip((pageNumber - 1) * pageSize)
            // .limit(pageSize)
            .select("-__v -tagsString -tags")
            .sort({ _id: -1 });
        await (0, post_1.getPosts)(userId, posts, res);
    }
    catch (e) {
        next(new Error("Error in getting all posts: " + e));
    }
};
exports.getAllPosts = getAllPosts;
// TODO: Create a reusable function for creating a mod post and sub posts
const getMyPosts = async (req, res, next) => {
    const userId = req.params.userId;
    const pageNumber = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;
    try {
        const posts = await post_1.default.find({ "creator.id": userId })
            // .skip((pageNumber - 1) * pageSize)
            // .limit(pageSize)
            .select("-__v -tagsString -tags")
            .sort({ _id: -1 });
        await (0, post_1.getPosts)(userId, posts, res);
    }
    catch (e) {
        next(new Error("Error in getting user's posts: " + e));
    }
};
exports.getMyPosts = getMyPosts;
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
            return res.status(404).send({ msg: "User not found" });
        const { postId } = req.params;
        const post = await post_1.default.findById(postId).select("_id reactions creator text");
        if (!post)
            return res.status(404).send({ msg: "No post with the given ID" });
        const reaction = post.reactions.find((reaction) => reaction.userId.toHexString() === reactingUserId);
        if (reaction) {
            // If the user doesn't want to react anymore
            if (reaction.type === reactionType) {
                await post_1.default.updateOne({ _id: postId }, { $pull: { reactions: { userId: reactingUserId } } });
                await post_1.default.updateOne({ _id: postId }, { $inc: { reactionCount: -1 } });
                // If the user changes their reaction.
            }
            else {
                await post_1.default.updateOne({ _id: postId }, { $pull: { reactions: { userId: reactingUserId } } });
                await post_1.default.updateOne({ _id: postId }, {
                    $push: {
                        reactions: { userId: reactingUserId, type: reactionType },
                    },
                });
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
            const payload = (0, functions_1.getNotificationPayload)(post.text);
            const existingNotif = await notification_1.default.findOne({
                contentId: postId,
                type: notifType,
            }).select("_id");
            if (!existingNotif) {
                await notification_1.default.insertMany([
                    new notification_1.default({
                        creators,
                        owners,
                        subscriber: { id: reactingUserId },
                        type: notifType,
                        phrase,
                        payload,
                        contentId: postId,
                    }),
                    new notification_1.default({
                        creators,
                        owners,
                        subscriber: { id: post.creator.id },
                        type: notifType,
                        phrase,
                        payload,
                        contentId: postId,
                    }),
                ]);
            }
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
                    description: constants_1.txDesc.contentCreation,
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
