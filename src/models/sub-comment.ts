import mongoose, { Schema } from "mongoose";
import Joi from "joi";

import {
  SubComment,
  AddSubCommentData,
  ReactToSubCommentParams,
} from "../types/sub-comment";
import ReactionSchema from "./schemas/reaction";

const schema = new Schema<SubComment>({
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

export default mongoose.model("Sub-Comment", schema);

export function validateAddSubCommentData(data: AddSubCommentData) {
  return Joi.object({
    text: Joi.string().trim().min(1).max(250).required(),
    subPostId: Joi.string()
      .trim()
      .regex(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
  }).validate(data);
}

export function validateReactToSubCommentParams(data: ReactToSubCommentParams) {
  return Joi.object({
    subCommentId: Joi.string()
      .trim()
      .regex(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
  }).validate(data);
}
