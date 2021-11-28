import mongoose, { Schema } from "mongoose";
import Joi from 'joi';

import SubPost, {ReactToSubPostParams} from "../types/sub-post";
import ReactionSchema from "../models/schemas/reaction";

const schema = new Schema<SubPost>({
  type: {
    type: String,
    trim: true,
    enum: ["Image", "Video", "Gif", "Sticker"],
    required: true,
  },
  ppid: { type: Schema.Types.ObjectId, required: true },
  url: { type: String, required: true },
  dUrl: { type: String, required: true },
  reactions: [ReactionSchema],
  reactionCount: Number,
  views: [String],
  viewCount: Number,
  subCommentCount: Number,
});

export default mongoose.model("Sub-Post", schema);

export function validateReactToSubPostParams(data: ReactToSubPostParams) {
  return Joi.object({
    subPostId: Joi.string()
      .trim()
      .regex(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
  }).validate(data);
}
