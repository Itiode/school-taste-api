import { RequestHandler } from "express";

import {
  SubPostComment,
  AddSubPostCommentReqBody,
  AddSubPostCommentResBody,
  ReactToSubPostCommentParams,
  SubPostCommentData,
  GetSubPostCommentsQuery,
  GetSubPostCommentsResBody,
} from "../../types/comment/sub-post-comment";
import SubPostCommentModel, {
  validateAddSubPostCommentData,
  validateReactToSubPostCommentParams,
} from "../../models/comment/sub-post-comment";
import SubPostModel from "../../models/sub-post";
import UserModel from "../../models/user";
import { validateReactionType } from "../../shared/utils/validators";
import { SimpleRes } from "../../types/shared";
import { formatDate } from "../../shared/utils/functions";

export const addSubPostComment: RequestHandler<
  any,
  AddSubPostCommentResBody,
  AddSubPostCommentReqBody
> = async (req, res, next) => {
  const { error } = validateAddSubPostCommentData(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const userId = req["user"].id;

    const { text, subPostId } = req.body;

    const subPost = await SubPostModel.findById(subPostId).select("_id");
    if (!subPost)
      return res.status(404).send({ msg: "No sub post with the given ID" });

    const user = await UserModel.findById(userId).select("name profileImage");
    if (!user)
      return res.status(404).send({ msg: "No user with the given ID" });

    const comment = await new SubPostCommentModel({
      text,
      subPostId,
      creator: {
        id: userId,
      },
    }).save();

    const transformedC: SubPostCommentData = {
      id: comment._id,
      text: comment.text,
      creator: {
        id: comment.creator.id,
        name: `${user.name.first} ${user.name.last}`,
        imageUrl: user.profileImage.original.url,
      },
      subPostId: comment.subPostId,
      date: comment.date,
      formattedDate: formatDate(comment.date.toISOString()),
      reactionCount: 0,
      reaction: { type: "", userId: "" },
    };

    await SubPostModel.updateOne(
      { _id: subPostId },
      { $inc: { commentCount: 1 } }
    );

    res
      .status(201)
      .send({ msg: "Sub post comment added successfully", data: transformedC });
  } catch (e) {
    next(new Error("Error in adding sub post comment: " + e));
  }
};

export const reactToSubPostComment: RequestHandler<
  ReactToSubPostCommentParams,
  SimpleRes
> = async (req, res, next) => {
  const { error } = validateReactToSubPostCommentParams(req.params);
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

    const subComment = await SubPostCommentModel.findById(commentId);
    if (!subComment)
      return res
        .status(404)
        .send({ msg: "No sub post comment with the given ID" });

    const reaction = subComment.reactions.find(
      (reaction: any) => reaction.userId.toHexString() === userId
    );

    if (reaction) {
      // If the user doesn't want to react anymore
      if (reaction.type === reactionType) {
        await SubPostCommentModel.updateOne(
          { _id: commentId },
          { $pull: { reactions: { userId } } }
        );
        await SubPostCommentModel.updateOne(
          { _id: commentId },
          { $inc: { reactionCount: -1 } }
        );
        // If the user changes their reaction.
      } else {
        await SubPostCommentModel.updateOne(
          { _id: commentId },
          { $pull: { reactions: { userId } } }
        );

        await SubPostCommentModel.updateOne(
          { _id: commentId },
          { $push: { reactions: { userId, type: reactionType } } }
        );
      }

      return res.send({ msg: "Reacted to sub post comment successfully" });
    }

    // When the user reacts for the first time.
    await SubPostCommentModel.updateOne(
      { _id: commentId },
      { $push: { reactions: { userId, type: reactionType } } }
    );
    await SubPostCommentModel.updateOne(
      { _id: commentId },
      { $inc: { reactionCount: 1 } }
    );

    res.send({ msg: "Reacted to sub post comment successfully" });
  } catch (e) {
    next(new Error("Error in reacting to sub post comment: " + e));
  }
};

export const getSubPostComments: RequestHandler<
  { subPostId: string },
  GetSubPostCommentsResBody,
  any,
  GetSubPostCommentsQuery
> = async (req, res, next) => {
  try {
    const userId = req["user"].id;
    const pageNumber = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;

    const comments = await SubPostCommentModel.find({
      subPostId: req.params.subPostId,
    })
      // .skip((pageNumber - 1) * pageSize)
      // .limit(pageSize)
      .select("-__v")
      .sort({ _id: -1 });

    const transformedComments: SubPostCommentData[] = comments.map(
      (c: SubPostComment) => {
        const reaction = c.reactions.find(
          (r: any) => r.userId.toHexString() === userId
        );

        return {
          id: c._id,
          text: c.text,
          creator: c.creator,
          subPostId: c.subPostId,
          date: c.date,
          formattedDate: formatDate(c.date.toISOString()),
          reactionCount: c.reactionCount ? c.reactionCount : 0,
          reaction: reaction ? reaction : { type: "", userId: "" },
        };
      }
    );

    res.send({
      msg: "Sub post comments gotten successfully",
      commentCount: transformedComments.length,
      data: transformedComments,
    });
  } catch (e) {
    next(new Error("Error in getting sub post comments: " + e));
  }
};
