"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.birthdayNotificationType = exports.subCommentNotificationType = exports.commentNotificationType = exports.subPostNotificationType = exports.postNotificationType = exports.validSubPostTypes = exports.validReactionTypes = exports.maxViewsForRubyCredit = exports.rubyDebit = exports.rubyCredit = exports.txDescription = void 0;
exports.txDescription = {
    contentCreation: "SchoolTaste content creation",
    whatsPoolWinner: "WhatsPool winner",
    whatsPoolSportsWinner: "WhatsPool winner (Sports competition)",
    whatsPoolMusicWinner: "WhatsPool winner (Music competion)",
    whatsPoolGenWinner: "WhatsPool winner (General questions)",
};
exports.rubyCredit = {
    contentCreation: 1,
    whatsPoolWinner: 2,
};
exports.rubyDebit = {
    whatsPoolReg: 1,
};
exports.maxViewsForRubyCredit = 10;
exports.validReactionTypes = [
    "Like",
    "Love",
    "Celebrate",
    "Support",
    "Curious",
    "Sad",
    "Crying",
];
exports.validSubPostTypes = ["Image", "Video", "Gif", "Sticker"];
// POST NOTIFICATION TYPES
exports.postNotificationType = {
    createdPostNotification: "CreatedPostNotification",
    likedPostNotification: "LikedPostNotification",
    reactedToPostNotification: "ReactedToPostNotification",
    commentedOnPostNotification: "CommentedOnPostNotification",
};
exports.subPostNotificationType = {
    likedSubPostNotification: "LikedSubPostNotification",
    reactedToSubPostNotification: "ReactedToSubPostNotification",
};
exports.commentNotificationType = {
    likedCommentNotification: "LikedCommentNotification",
    reactedToCommentNotification: "ReactedToCommentNotification",
};
exports.subCommentNotificationType = {
    likedSubCommentNotification: "LikedSubCommentNotification",
    reactedToSubCommentNotification: "ReactedToSubCommentNotification",
};
exports.birthdayNotificationType = {
    birthdayNotification: "BirthdayNotification",
};
