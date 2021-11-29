import mongoose, { Schema } from "mongoose";
import Joi from "joi";

import {
  Post,
  CreatePostReq,
  ReactToPostParams,
  ViewPostParams,
} from "../types/post";

import reactionSchema from "./schemas/reaction";
import schoolSchema from "./schemas/school";
import studentDataSchema from "./schemas/student-data";

const schema = new Schema<Post>({
  creator: {
    id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true, maxLength: 250, required: true },
  },
  title: {
    type: String,
    trim: true,
    minLength: 1,
    maxLength: 100,
    required: true,
  },
  body: { type: String, trim: true, maxLength: 5000 },
  school: schoolSchema,
  studentData: studentDataSchema,
  searchText: { type: String, trim: true, maxLength: 500, required: true },
  tags: { type: [String] },
  date: { type: Date, default: Date.now },
  reactions: [reactionSchema],
  reactionCount: Number,
  views: [String],
  viewCount: Number,
  commentCount: Number,
});

export default mongoose.model("Post", schema);

export function validateCreatePostReq(data: CreatePostReq) {
  return Joi.object({
    title: Joi.string().trim().max(250).required(),
    body: Joi.string().trim().max(5000),
  }).validate(data);
}

export function validateReactToPostParams(data: ReactToPostParams) {
  return Joi.object({
    postId: Joi.string()
      .trim()
      .regex(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
  }).validate(data);
}

export function validateViewPostReq(data: ViewPostParams) {
  return Joi.object({
    postId: Joi.string()
      .trim()
      .regex(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
  }).validate(data);
}
