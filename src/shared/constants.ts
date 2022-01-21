export const validReactionTypes: string[] = [
  "like",
  "love",
  "celebrate",
  "support",
  "curious",
  "sad",
  "crying",
];

export const validSubPostTypes: string[] = ["image", "video", "gif", "sticker"];

export const notificationPhrase = {
  awarded: "awarded",
  created: "created a",
  liked: "liked",
  reacted: "reacted to",
  commented: "commented on",
  shared: "shared",
};

// POST NOTIFICATION TYPES
export const postNotificationType = {
  createdPostNotification: "CreatedPostNotification",
  likedPostNotification: "LikedPostNotification",
  reactedToPostNotification: "ReactedToPostNotification",
  commentedOnPostNotification: "CommentedOnPostNotification",
};

// COMMENT NOTIFICATION TYPES
export const commentNotificationType = {
  likedCommentNotification: "LikedCommentNotification",
  reactedToCommentNotification: "ReactedToCommentNotification",
};

// BIRTHDAY NOTIFICATION TYPES
export const birthdayNotificationType = {
  birthdayNotification: "BirthdayNotification",
};
