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
import UserModel from "../models/user";
import { TempUser } from "../types/user";

import reactionSchema from "./schemas/reaction";
import schoolSchema from "./schemas/school";
import studentDataSchema from "./schemas/student-data";

const schema = new Schema<Post>({
  creator: {
    id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true, maxLength: 250, required: true },
  },
  text: { type: String, trim: true, maxLength: 10000, required: true },
  school: schoolSchema,
  studentData: studentDataSchema,
  tagsString: { type: String, trim: true, required: true },
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
    text: Joi.string().trim().max(10000).required(),
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
  const tempUsers: TempUser[] = [];

  for (const p of posts) {
    const subPosts = await SubPostModel.find({ ppid: p._id }).select(
      "-__v -views -dUrl"
    );

    let tempUser: TempUser;

    const isFetched = tempUsers.find(tU => tU.id === p.creator.id);
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
      tempUser = tempUsers.find(tU => tU.id === p.creator.id)!;
    }

    const modifiedSubPosts: SubPostRes[] = [];
    for (const sP of subPosts) {
      const sPReaction = sP.reactions.find(
        (r: any) => r.userId.toHexString() === userId
      );

      modifiedSubPosts.push({
        id: sP._id,
        type: sP.type,
        url: sP.url,
        ppid: sP.ppid,
        reaction: sPReaction ? sPReaction : { type: "", userId: "" },
        reactionCount: sP.reactionCount ? sP.reactionCount : 0,
        commentCount: sP.commentCount,
        viewCount: sP.viewCount,
      });
    }

    const postReaction = p.reactions.find(
      (r: any) => r.userId.toHexString() === userId
    );

    const modPost: PostRes = {
      id: p._id,
      creator: {
        id: tempUser.id,
        name: tempUser.fullName,
        imageUrl: tempUser.userImage.original.url,
      },
      text: p.text,
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
