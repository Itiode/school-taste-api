"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rubyNotificationType = exports.birthdayNotificationType = exports.commentNotificationType = exports.postNotificationType = exports.notificationPhrase = exports.validSubPostTypes = exports.validReactionTypes = exports.maxViewsForRubyCredit = exports.rubyCredit = exports.txDesc = void 0;
exports.txDesc = {
    signupBonus: "Welcome bonus",
    contentCreation: "SchoolTaste content creation",
    whatsPoolWinner: "WhatsPool winner",
    whatsPoolSportsWinner: "WhatsPool winner (Sports competition)",
    whatsPoolMusicWinner: "WhatsPool winner (Music competion)",
    whatsPoolGenWinner: "WhatsPool winner (General questions)",
};
exports.rubyCredit = {
    contentCreation: 1,
    whatsPoolWinner: 1,
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
    awarded: "awarded",
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
// COMMENT NOTIFICATION TYPES
exports.commentNotificationType = {
    likedCommentNotification: "LikedCommentNotification",
    reactedToCommentNotification: "ReactedToCommentNotification",
};
// BIRTHDAY NOTIFICATION TYPES
exports.birthdayNotificationType = {
    birthdayNotification: "BirthdayNotification",
};
// RUBY NOTIFICATION TYPES
exports.rubyNotificationType = {
    awardedRubyNotification: "AwardedRubyNotification",
};
