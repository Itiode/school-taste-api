import { RequestHandler } from "express";

import {
  PostComment,
  AddPostCommentReqBody,
  AddPostCommentResBody,
  ReactToPostCommentParams,
  GetPostCommentsQuery,
  GetPostCommentsResBody,
  PostCommentData,
} from "../../types/comment/post-comment";
import PostCommentModel, {
  validateAddPostCommentData,
  validateReactToPostCommentParams,
} from "../../models/comment/post-comment";
import PostModel from "../../models/post";
import UserModel from "../../models/user";
import NotificationModel from "../../models/notification";
import { validateReactionType } from "../../shared/utils/validators";
import { SimpleRes } from "../../types/shared";
import {
  postNotificationType,
  notificationPhrase,
} from "../../shared/constants";
import {
  getNotificationPayload,
  formatDate,
} from "../../shared/utils/functions";
import { TempUser, User } from "../../types/user";

export const addPostComment: RequestHandler<
  any,
  AddPostCommentResBody,
  AddPostCommentReqBody
> = async (req, res, next) => {
  const { error } = validateAddPostCommentData(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const userId = req["user"].id;

    const { text, postId } = req.body;

    const post = await PostModel.findById(postId).select("_id creator");
    if (!post) return res.status(404).send({ msg: "Post not found" });

    const user = await UserModel.findById(userId).select("name");
    const postOwner = await UserModel.findById(post.creator.id).select("name");

    if (!user || !postOwner)
      return res.status(404).send({ msg: "User not found" });

    const comment = await new PostCommentModel({
      text,
      postId,
      creator: {
        id: userId,
      },
    }).save();

    const transformedC: PostCommentData = {
      id: comment._id,
      text: comment.text,
      creator: comment.creator,
      postId: comment.postId,
      date: comment.date,
      formattedDate: formatDate(comment.date.toString()),
      reactionCount: comment.reactionCount ? comment.reactionCount : 0,
      reaction: { type: "", userId: "" },
    };

    await PostModel.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });

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

      const phrase = notificationPhrase.commented;
      const payload = getNotificationPayload(text);

      await NotificationModel.insertMany([
        new NotificationModel({
          creators,
          owners,
          subscriber: { id: post.creator.id },
          contentId: post._id,
          type: postNotificationType.commentedOnPostNotification,
          phrase,
          payload,
        }),
        new NotificationModel({
          creators,
          owners,
          subscriber: { id: userId },
          contentId: post._id,
          type: postNotificationType.commentedOnPostNotification,
          phrase,
          payload,
        }),
      ]);
    }

    res
      .status(201)
      .send({ msg: "Post comment added successfully", data: transformedC });
  } catch (e) {
    next(new Error("Error in adding post comment: " + e));
  }
};

export const reactToPostComment: RequestHandler<
  ReactToPostCommentParams,
  SimpleRes
> = async (req, res, next) => {
  const { error } = validateReactToPostCommentParams(req.params);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const { reactionType } = req.body;
    const rxTypeIsValid = validateReactionType(reactionType);
    if (!rxTypeIsValid)
      return res.status(400).send({ msg: "Invalid reaction type" });

    const userId = req["user"].id;

    const user = await UserModel.findById(userId).select("_id");
    if (!user) return res.status(404).send({ msg: "User not found" });

    const { commentId } = req.params;

    const comment = await PostCommentModel.findById(commentId);
    if (!comment)
      return res.status(404).send({ msg: "Post comment not found" });

    const reaction = comment.reactions.find(
      (reaction: any) => reaction.userId.toHexString() === userId
    );

    if (reaction) {
      // If the user doesn't want to react anymore
      if (reaction.type === reactionType) {
        await PostCommentModel.updateOne(
          { _id: commentId },
          { $pull: { reactions: { userId } } }
        );
        await PostCommentModel.updateOne(
          { _id: commentId },
          { $inc: { reactionCount: -1 } }
        );
        // If the user changes their reaction.
      } else {
        await PostCommentModel.updateOne(
          { _id: commentId },
          { $pull: { reactions: { userId } } }
        );

        await PostCommentModel.updateOne(
          { _id: commentId },
          { $push: { reactions: { userId, type: reactionType } } }
        );
      }

      return res.send({ msg: "Reacted to post comment successfully" });
    }

    // When the user reacts for the first time.
    await PostCommentModel.updateOne(
      { _id: commentId },
      { $push: { reactions: { userId, type: reactionType } } }
    );
    await PostCommentModel.updateOne(
      { _id: commentId },
      { $inc: { reactionCount: 1 } }
    );

    res.send({ msg: "Reacted to post comment successfully" });
  } catch (e) {
    next(new Error("Error in reacting to post comment: " + e));
  }
};

export const getPostComments: RequestHandler<
  { postId: string },
  GetPostCommentsResBody,
  any,
  GetPostCommentsQuery
> = async (req, res, next) => {
  try {
    const userId = req["user"].id;
    const pageNumber = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;

    const comments: PostComment[] = await PostCommentModel.find({
      postId: req.params.postId,
    })
      // .skip((pageNumber - 1) * pageSize)
      // .limit(pageSize)
      .select("-__v")
      .sort({ _id: -1 });

    const transformedComments: PostCommentData[] = [];
    const tempUsers: TempUser[] = [];

    for (const c of comments) {
      let tempUser: TempUser;

      const isFetched = tempUsers.find((tU) => tU.id === c.creator.id);
      if (!isFetched) {
        const creator: User = await UserModel.findById(c.creator.id).select(
          "name profileImage"
        );

        tempUser = {
          id: creator._id,
          fullName: `${creator.name.first} ${creator.name.last}`,
          userImage: creator.profileImage,
        };
        tempUsers.push(tempUser);
      } else {
        tempUser = tempUsers.find((tU) => tU.id === c.creator.id)!;
      }

      const reaction = c.reactions.find(
        (r: any) => r.userId.toHexString() === userId
      );

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
        formattedDate: formatDate(c.date.toString()),
        reactionCount: c.reactionCount ? c.reactionCount : 0,
        reaction: reaction ? reaction : { type: "", userId: "" },
      });
    }

    res.send({
      msg: "Post comments gotten successfully",
      commentCount: transformedComments.length,
      data: transformedComments,
    });
  } catch (e) {
    next(new Error("Error in getting post comments: " + e));
  }
};
