import { RequestHandler } from "express";

import {
  SubPostComment,
  AddSubPostCommentData,
  ReactToSubPostCommentParams,
  SubPostCommentRes,
  GetSubPostCommentsQuery,
  GetSubPostCommentsRes,
} from "../../types/comment/sub-post-comment";
import SubPostCommentModel, {
  validateAddSubPostCommentData,
  validateReactToSubPostCommentParams,
} from "../../models/comment/sub-post-comment";
import SubPostModel from "../../models/sub-post";
import UserModel from "../../models/user";
import { validateReactionType } from "../../shared/utils/validators";
import { SimpleRes } from "../../types/shared";
import { formatDate } from "../../shared/utils/date-format";

export const addSubPostComment: RequestHandler<
  any,
  SimpleRes,
  AddSubPostCommentData
> = async (req, res, next) => {
  const { error } = validateAddSubPostCommentData(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const userId = req["user"].id;

    const { text, subPostId } = req.body;

    const subPost = await SubPostModel.findById(subPostId).select("_id");
    if (!subPost)
      return res.status(404).send({ msg: "No sub post with the given ID" });

    const user = await UserModel.findById(userId).select("name");
    if (!user)
      return res.status(404).send({ msg: "No user with the given ID" });

    await new SubPostCommentModel({
      text,
      subPostId,
      creator: {
        id: userId,
        name: `${user.name.first} ${user.name.last}`,
      },
    }).save();

    await SubPostModel.updateOne(
      { _id: subPostId },
      { $inc: { commentCount: 1 } }
    );

    res.status(201).send({ msg: "Sub post comment added successfully" });
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
  GetSubPostCommentsRes,
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

    const transformedComments: SubPostCommentRes[] = comments.map(
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
          formattedDate: formatDate(c.date.toString()),
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
