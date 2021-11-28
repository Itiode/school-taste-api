import { RequestHandler } from "express";

import {
  SubComment,
  AddSubCommentData,
  ReactToSubCommentParams,
  GetSubCommentsQuery,
  GetSubCommentsRes,
} from "../types/sub-comment";
import SubCommentModel, {
  validateAddSubCommentData,
  validateReactToSubCommentParams,
} from "../models/sub-comment";
import SubPostModel from "../models/sub-post";
import UserModel from "../models/user";
import { validateReactionType } from "../shared/utils/validators";
import { SimpleRes } from "../types/shared";

export const addSubComment: RequestHandler<any, SimpleRes, AddSubCommentData> =
  async (req, res, next) => {
    const { error } = validateAddSubCommentData(req.body);
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

      await new SubCommentModel({
        text,
        subPostId,
        creator: {
          id: userId,
          name: `${user.name.first} ${user.name.last}`,
        },
      }).save();

      await SubPostModel.updateOne(
        { _id: subPostId },
        { $inc: { subCommentCount: 1 } }
      );

      res.status(201).send({ msg: "Sub comment added successfully" });
    } catch (e) {
      next(new Error("Error in adding sub comment: " + e));
    }
  };

export const reactToSubComment: RequestHandler<
  ReactToSubCommentParams,
  SimpleRes
> = async (req, res, next) => {
  const { error } = validateReactToSubCommentParams(req.params);
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

    const { subCommentId } = req.params;

    const subComment = await SubCommentModel.findById(subCommentId);
    if (!subComment)
      return res.status(404).send({ msg: "No sub comment with the given ID" });

    const reaction = subComment.reactions.find(
      (reaction: any) => reaction.userId.toHexString() === userId
    );

    if (reaction) {
      // If the user doesn't want to react anymore
      if (reaction.type === reactionType) {
        await SubCommentModel.updateOne(
          { _id: subCommentId },
          { $pull: { reactions: { userId } } }
        );
        await SubCommentModel.updateOne(
          { _id: subCommentId },
          { $inc: { reactionCount: -1 } }
        );
        // If the user changes their reaction.
      } else {
        await SubCommentModel.updateOne(
          { _id: subCommentId },
          { $pull: { reactions: { userId } } }
        );

        await SubCommentModel.updateOne(
          { _id: subCommentId },
          { $push: { reactions: { userId, type: reactionType } } }
        );
      }

      return res.send({ msg: "Reacted to sub comment successfully" });
    }

    // When the user reacts for the first time.
    await SubCommentModel.updateOne(
      { _id: subCommentId },
      { $push: { reactions: { userId, type: reactionType } } }
    );
    await SubCommentModel.updateOne(
      { _id: subCommentId },
      { $inc: { reactionCount: 1 } }
    );

    res.send({ msg: "Reacted to sub comment successfully" });
  } catch (e) {
    next(new Error("Error in reacting to sub comment: " + e));
  }
};

export const getSubComments: RequestHandler<
  { subPostId: string },
  GetSubCommentsRes,
  any,
  GetSubCommentsQuery
> = async (req, res, next) => {
  try {
    const userId = req["user"].id;
    const pageNumber = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;

    const subComments = await SubCommentModel.find({
      subPostId: req.params.subPostId,
    })
      // .skip((pageNumber - 1) * pageSize)
      // .limit(pageSize)
      .select("-__v")
      .sort({ _id: -1 });

    const transformedSubComments = subComments.map((sC: SubComment) => {
      const reaction = sC.reactions.find(
        (r: any) => r.userId.toHexString() === userId
      );

      return {
        id: sC._id,
        text: sC.text,
        creator: sC.creator,
        subPostId: sC.subPostId,
        date: sC.date,
        reactionCount: sC.reactionCount ? sC.reactionCount : 0,
        reaction: reaction ? reaction : { type: "", userId: "" },
      };
    });

    res.send({
      msg: "Sub comments gotten successfully",
      subCommentCount: transformedSubComments.length,
      data: transformedSubComments,
    });
  } catch (e) {
    next(new Error("Error in getting sub comments: " + e));
  }
};
