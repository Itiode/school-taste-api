import { RequestHandler } from "express";

import {
  Comment,
  AddCommentData,
  ReactToCommentParams,
  GetCommentsQuery,
  GetCommentsRes,
} from "../types/comment";
import CommentModel, {
  validateAddCommentData,
  validateReactToCommentParams,
} from "../models/comment";
import PostModel from "../models/post";
import UserModel from "../models/user";
import NotificationModel from "../models/notification";
import { validateReactionType } from "../shared/utils/validators";
import { SimpleRes } from "../types/shared";
import { postNotificationType } from "../shared/constants";
import { getNotificationPayload } from "../shared/utils/functions";

export const addComment: RequestHandler<any, SimpleRes, AddCommentData> =
  async (req, res, next) => {
    const { error } = validateAddCommentData(req.body);
    if (error) return res.status(400).send({ msg: error.details[0].message });

    try {
      const userId = req["user"].id;

      const { text, postId } = req.body;

      const post = await PostModel.findById(postId).select("_id creator");
      if (!post)
        return res.status(404).send({ msg: "No post with the given ID" });

      const user = await UserModel.findById(userId).select("name");
      const { name } = user;

      if (!user)
        return res.status(404).send({ msg: "No user with the given ID" });

      await new CommentModel({
        text,
        postId,
        creator: {
          id: userId,
          name: `${name.first} ${name.last}`,
        },
      }).save();

      await PostModel.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });

      await new NotificationModel({
        creators: [
          {
            id: userId,
            name: `${name.first} ${name.last}`,
          },
        ],
        subscriber: { id: post.creator.id },
        type: postNotificationType.commentedOnPostNotification,
        phrase: "commented on",
        payload: getNotificationPayload(text),
      }).save();

      if (userId !== post.creator.id.toHexString()) {
        await new NotificationModel({
          creators: [
            {
              id: userId,
              name: `${name.first} ${name.last}`,
            },
          ],
          subscriber: { id: userId },
          type: postNotificationType.commentedOnPostNotification,
          phrase: "commented on",
          payload: getNotificationPayload(text),
        }).save();
      }

      res.status(201).send({ msg: "Comment added successfully" });
    } catch (e) {
      next(new Error("Error in adding comment: " + e));
    }
  };

export const reactToComment: RequestHandler<ReactToCommentParams, SimpleRes> =
  async (req, res, next) => {
    const { error } = validateReactToCommentParams(req.params);
    if (error) return res.status(400).send({ msg: error.details[0].message });

    try {
      const { reactionType } = req.body;
      const rxTypeIsValid = validateReactionType(reactionType);
      if (!rxTypeIsValid)
        return res.status(400).send({ msg: "Invalid reaction type" });

      const userId = req["user"].id;

      const user = await UserModel.findById(userId).select("_id");
      if (!user)
        return res.status(404).send({ msg: "No user with the given ID" });

      const { commentId } = req.params;

      const comment = await CommentModel.findById(commentId);
      if (!comment)
        return res.status(404).send({ msg: "No comment with the given ID" });

      const reaction = comment.reactions.find(
        (reaction: any) => reaction.userId.toHexString() === userId
      );

      if (reaction) {
        // If the user doesn't want to react anymore
        if (reaction.type === reactionType) {
          await CommentModel.updateOne(
            { _id: commentId },
            { $pull: { reactions: { userId } } }
          );
          await CommentModel.updateOne(
            { _id: commentId },
            { $inc: { reactionCount: -1 } }
          );
          // If the user changes their reaction.
        } else {
          await CommentModel.updateOne(
            { _id: commentId },
            { $pull: { reactions: { userId } } }
          );

          await CommentModel.updateOne(
            { _id: commentId },
            { $push: { reactions: { userId, type: reactionType } } }
          );
        }

        return res.send({ msg: "Reacted to comment successfully" });
      }

      // When the user reacts for the first time.
      await CommentModel.updateOne(
        { _id: commentId },
        { $push: { reactions: { userId, type: reactionType } } }
      );
      await CommentModel.updateOne(
        { _id: commentId },
        { $inc: { reactionCount: 1 } }
      );

      res.send({ msg: "Reacted to comment successfully" });
    } catch (e) {
      next(new Error("Error in reacting to comment: " + e));
    }
  };

export const getComments: RequestHandler<
  { postId: string },
  GetCommentsRes,
  any,
  GetCommentsQuery
> = async (req, res, next) => {
  try {
    const userId = req["user"].id;
    const pageNumber = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;

    const comments = await CommentModel.find({ postId: req.params.postId })
      // .skip((pageNumber - 1) * pageSize)
      // .limit(pageSize)
      .select("-__v")
      .sort({ _id: -1 });

    const transformedComments = comments.map((c: Comment) => {
      const reaction = c.reactions.find(
        (r: any) => r.userId.toHexString() === userId
      );

      return {
        id: c._id,
        text: c.text,
        creator: c.creator,
        postId: c.postId,
        date: c.date,
        reactionCount: c.reactionCount ? c.reactionCount : 0,
        reaction: reaction ? reaction : { type: "", userId: "" },
      };
    });

    res.send({
      msg: "Comments gotten successfully",
      commentCount: transformedComments.length,
      data: transformedComments,
    });
  } catch (e) {
    next(new Error("Error in getting comments: " + e));
  }
};
