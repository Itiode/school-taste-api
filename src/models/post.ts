import mongoose, { Schema } from "mongoose";
import Joi from "joi";
import { Response } from "express";

import {
  Post,
  CreatePostReqBody,
  ReactToPostParams,
  ViewPostParams,
  ModifiedPost,
} from "../types/post";
import SubPost, { ModifiedSubPost } from "../types/sub-post";
import SubPostModel from "../models/sub-post";
import { formatDate } from "../shared/utils/functions";
import UserModel from "../models/user";
import { TempUser } from "../types/user";

import reactionSchema from "./schemas/reaction";
import studentDataSchema from "./schemas/student-data";
import { JoiValidators } from "../shared/utils/validators";

const schema = new Schema<Post>({
  creator: {
    id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  text: { type: String, trim: true, maxlength: 10000, default: "" },
  studentData: { type: studentDataSchema, required: true },
  tagsString: { type: String, trim: true, required: true },
  audience: {
    type: String,
    trim: true,
    enum: ["public", "school", "faculty", "department", "level"],
    default: "public",
    required: true,
  },
  tags: { type: [String] },
  date: { type: Date, default: Date.now },
  reactions: [reactionSchema],
  reactionCount: Number,
  views: [String],
  viewCount: Number,
  commentCount: Number,
});

export default mongoose.model("Post", schema);

export function valCreatePostReqBody(data: CreatePostReqBody) {
  return Joi.object({
    text: Joi.string().trim().max(10000).allow(""),
  }).validate(data);
}

export function valCreateTextPostReqBody(data: CreatePostReqBody) {
  return Joi.object({
    text: Joi.string().trim().min(1).max(10000).required(),
  }).validate(data);
}

export function validateReactToPostParams(data: ReactToPostParams) {
  return Joi.object({
    postId: JoiValidators.id.required(),
  }).validate(data);
}

export function validateViewPostReq(data: ViewPostParams) {
  return Joi.object({
    postId: JoiValidators.id.required(),
  }).validate(data);
}

export async function getPosts(userId: string, posts: any[], res: Response) {
  const modifiedPosts: ModifiedPost[] = [];
  const tempUsers: TempUser[] = [];

  for (const p of posts) {
    // If no subposts are found, leading to an empty list,
    // that means it is a text-only post.
    const subPosts: SubPost[] = await SubPostModel.find({ ppid: p._id }).select(
      "-__v -views -dUrl"
    );

    let tempUser: TempUser;

    const isFetched = tempUsers.find((tU) => tU.id === p.creator.id);
    if (!isFetched) {
      const creator = await UserModel.findById(p.creator.id).select(
        "name profileImage"
      );

      tempUser = {
        id: creator._id,
        fullName: `${creator.name.first} ${creator.name.last}`,
        userImage: creator.profileImage,
      };
      tempUsers.push(tempUser);
    } else {
      tempUser = tempUsers.find((tU) => tU.id === p.creator.id)!;
    }

    const modifiedSubPosts: ModifiedSubPost[] = [];
    if (subPosts.length > 0) {
      for (const sP of subPosts) {
        const sPReaction = sP.reactions.find(
          (r: any) => r.userId.toHexString() === userId
        );

        modifiedSubPosts.push({
          id: sP._id,
          type: sP.type,
          item: sP.item,
          ppid: sP.ppid,
          reaction: sPReaction ? sPReaction : { type: "", userId: "" },
          reactionCount: sP.reactionCount ? sP.reactionCount : 0,
          commentCount: sP.commentCount,
          viewCount: sP.viewCount,
        });
      }
    }

    const postReaction = p.reactions.find(
      (r: any) => r.userId.toHexString() === userId
    );

    const modPost: ModifiedPost = {
      id: p._id,
      creator: {
        id: tempUser.id,
        name: tempUser.fullName,
        imageUrl: tempUser.userImage.thumbnail.url,
      },
      text: p.text,
      subPosts: modifiedSubPosts,
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
