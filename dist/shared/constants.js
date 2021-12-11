"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.birthdayNotificationType = exports.commentNotificationType = exports.postNotificationType = exports.notificationPhrase = exports.validSubPostTypes = exports.validReactionTypes = exports.maxViewsForRubyCredit = exports.rubyDebit = exports.rubyCredit = exports.txDescription = void 0;
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
exports.notificationPhrase = {
    created: "created",
    liked: "liked",
    reacted: "reacted",
    commented: "commented",
};
// POST NOTIFICATION TYPES
exports.postNotificationType = {
    createdPostNotification: "CreatedPostNotification",
    likedPostNotification: "LikedPostNotification",
    reactedToPostNotification: "ReactedToPostNotification",
    commentedOnPostNotification: "CommentedOnPostNotification",
};
exports.commentNotificationType = {
    likedCommentNotification: "LikedCommentNotification",
    reactedToCommentNotification: "ReactedToCommentNotification",
};
exports.birthdayNotificationType = {
    birthdayNotification: "BirthdayNotification",
};
