"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.birthdayNotificationType = exports.commentNotificationType = exports.postNotificationType = exports.notificationPhrase = exports.validSubPostTypes = exports.validReactionTypes = void 0;
exports.validReactionTypes = [
    "like",
    "love",
    "celebrate",
    "support",
    "curious",
    "sad",
    "crying",
];
exports.validSubPostTypes = ["image", "video", "gif", "sticker"];
exports.notificationPhrase = {
    awarded: "awarded",
    created: "created a",
    liked: "liked",
    reacted: "reacted to",
    commented: "commented on",
    shared: "shared",
};
// POST NOTIFICATION TYPES
exports.postNotificationType = {
    createdPostNotification: "CreatedPostNotification",
    likedPostNotification: "LikedPostNotification",
    reactedToPostNotification: "ReactedToPostNotification",
    commentedOnPostNotification: "CommentedOnPostNotification",
};
// COMMENT NOTIFICATION TYPES
exports.commentNotificationType = {
    likedCommentNotification: "LikedCommentNotification",
    reactedToCommentNotification: "ReactedToCommentNotification",
};
// BIRTHDAY NOTIFICATION TYPES
exports.birthdayNotificationType = {
    birthdayNotification: "BirthdayNotification",
};
