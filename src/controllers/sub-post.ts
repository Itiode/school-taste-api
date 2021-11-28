import { RequestHandler } from "express";

import UserModel from "../models/user";
import SubPostModel, { validateReactToSubPostParams } from "../models/sub-post";
import { SimpleRes } from "../types/shared";
import { ReactToSubPostData, ReactToSubPostParams } from "../types/sub-post";
import { validateReactionType } from "../shared/utils/validators";

export const reactToSubPost: RequestHandler<
  ReactToSubPostParams,
  SimpleRes,
  ReactToSubPostData
> = async (req, res, next) => {
  try {
    const { error } = validateReactToSubPostParams(req.params);
    if (error) return res.status(400).send({ msg: error.details[0].message });

    const { reactionType } = req.body;
    const rxTypeIsValid = validateReactionType(reactionType);
    if (!rxTypeIsValid)
      return res.status(400).send({ msg: "Invalid reaction type" });

    const userId = req["user"].id;

    const user = await UserModel.findById(userId).select("_id");

    if (!user)
      return res.status(404).send({ msg: "No user with the given ID" });

    const { subPostId } = req.params;

    const subPost = await SubPostModel.findById(subPostId).select(
      "_id reactions"
    );

    if (!subPost)
      return res.status(404).send({ msg: "No sub post with the given ID" });

    const reaction = subPost.reactions.find(
      (reaction: any) => reaction.userId.toHexString() === userId
    );

    if (reaction) {
      // If the user doesn't want to react anymore
      if (reaction.type === reactionType) {
        await SubPostModel.updateOne(
          { _id: subPostId },
          { $pull: { reactions: { userId } } }
        );
        await SubPostModel.updateOne(
          { _id: subPostId },
          { $inc: { reactionCount: -1 } }
        );
        // If the user changes their reaction.
      } else {
        await SubPostModel.updateOne(
          { _id: subPostId },
          { $pull: { reactions: { userId } } }
        );

        await SubPostModel.updateOne(
          { _id: subPostId },
          { $push: { reactions: { userId, type: reactionType } } }
        );
      }

      return res.send({ msg: "Reacted to sub post successfully" });
    }

    // When the user reacts for the first time.
    await SubPostModel.updateOne(
      { _id: subPostId },
      { $push: { reactions: { userId, type: reactionType } } }
    );
    await SubPostModel.updateOne(
      { _id: subPostId },
      { $inc: { reactionCount: 1 } }
    );

    res.send({ msg: "Reacted to sub post successfully" });
  } catch (e) {
    next(new Error("Error in reacting to sub post: " + e));
  }
};
