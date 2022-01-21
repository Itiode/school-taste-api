import mongoose, { Schema } from "mongoose";
import Joi from "joi";

import SubPost, { ReactToSubPostParams } from "../types/sub-post";
import reactionSchema from "../models/schemas/reaction";
import imageSchema from "../models/schemas/image";
import metadataSchema from "./schemas/metadata";

const schema = new Schema<SubPost>({
  type: {
    type: String,
    trim: true,
    enum: ["image", "video", "gif", "sticker"],
    required: true,
  },
  ppid: { type: Schema.Types.ObjectId, required: true, ref: "Post" },
  item: imageSchema,
  reactions: [reactionSchema],
  reactionCount: Number,
  views: [String],
  viewCount: Number,
  commentCount: Number,
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
