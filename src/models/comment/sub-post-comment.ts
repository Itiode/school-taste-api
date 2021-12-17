import mongoose, { Schema } from "mongoose";
import Joi from "joi";

import {
  SubPostComment,
  AddSubPostCommentData,
  ReactToSubPostCommentParams,
} from "../../types/comment/sub-post-comment";
import ReactionSchema from "../schemas/reaction";

const schema = new Schema<SubPostComment>({
  text: {
    type: String,
    trim: true,
    minLength: 1,
    maxLength: 250,
    required: true,
  },
  subPostId: { type: Schema.Types.ObjectId, required: true },
  creator: {
    id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    name: {
      type: String,
      trim: true,
      minLength: 5,
      maxLength: 50,
      required: true,
    },
  },
  date: { type: Date, default: Date.now },
  reactions: [ReactionSchema],
  reactionCount: Number,
});

export default mongoose.model("Sub-Post-Comment", schema);

export function validateAddSubPostCommentData(data: AddSubPostCommentData) {
  return Joi.object({
    text: Joi.string().trim().min(1).max(250).required(),
    subPostId: Joi.string()
      .trim()
      .regex(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
  }).validate(data);
}

export function validateReactToSubPostCommentParams(data: ReactToSubPostCommentParams) {
  return Joi.object({
    commentId: Joi.string()
      .trim()
      .regex(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
  }).validate(data);
}
