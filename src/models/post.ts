import mongoose, { Schema } from "mongoose";
import Joi from "joi";
import { Response } from "express";

import {
  Post,
  CreatePostReq,
  ReactToPostParams,
  ViewPostParams,
  PostRes,
} from "../types/post";
import { SubPostRes } from "../types/sub-post";
import SubPostModel from "../models/sub-post";
import { formatDate } from "../shared/utils/date-format";

import reactionSchema from "./schemas/reaction";
import schoolSchema from "./schemas/school";
import studentDataSchema from "./schemas/student-data";

const schema = new Schema<Post>({
  creator: {
    id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true, maxLength: 250, required: true },
  },
  shortText: {
    type: String,
    trim: true,
    minLength: 1,
    maxLength: 100,
    required: true,
  },
  longText: { type: String, trim: true, maxLength: 10000 },
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
    shortText: Joi.string().trim().max(250).required(),
    longText: Joi.string().trim().max(10000),
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

export async function getPosts(userId: string, posts: any[], res: Response) {
  const modifiedPosts: PostRes[] = [];

  for (const p of posts) {
    const subPosts = await SubPostModel.find({ ppid: p._id }).select(
      "-__v -views -ppid -dUrl"
    );

    const modifiedSubPosts: SubPostRes[] = [];
    for (const sP of subPosts) {
      const sPReaction = sP.reactions.find(
        (r: any) => r.userId.toHexString() === userId
      );

      modifiedSubPosts.push({
        id: sP._id,
        type: sP.type,
        url: sP.url,
        reaction: sPReaction ? sPReaction : { type: "", userId: "" },
        reactionCount: sP.reactionCount ? sP.reactionCount : 0,
        subCommentCount: sP.subCommentCount,
        viewCount: sP.viewCount,
      });
    }

    const postReaction = p.reactions.find(
      (r: any) => r.userId.toHexString() === userId
    );

    const modPost = {
      id: p._id,
      creator: p.creator,
      shortText: p.shortText,
      longText: p.longText,
      subPosts: modifiedSubPosts,
      school: p.school,
      studentData: p.studentData,
      date: p.date,
      formattedDate: formatDate(p.date),
      reactionCount: p.reactionCount ? p.reactionCount : 0,
      reaction: postReaction ? postReaction : { type: "", userId: "" },
      viewCount: p.viewCount,
      commentCount: p.commentCount,
    };

    modifiedPosts.push(modPost);
  }

  res.send({
    msg: "Posts gotten successfully",
    postCount: modifiedPosts.length,
    data: modifiedPosts,
  });
}
