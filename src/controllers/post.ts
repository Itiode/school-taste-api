import config from "config";
import { RequestHandler } from "express";
import * as firebase from "firebase-admin";

import PostModel, {
  validateCreatePostReq,
  validateReactToPostParams,
  validateViewPostReq,
} from "../models/post";
import NotificationModel from "../models/notification";
import SubPostModel from "../models/sub-post";
import UserModel from "../models/user";
import {
  Post,
  PostRes,
  CreatePostReq,
  GetPostsQuery,
  GetPostsRes,
  ReactToPostParams,
  ReactToPostReq,
  ViewPostParams,
} from "../types/post";
import { SubPostRes } from "../types/sub-post";
import Reaction from "../types/reaction";
import { SimpleRes, GetImageParams } from "../types/shared";
import TransactionModel from "../models/transaction";
import {
  txDescription,
  rubyCredit,
  maxViewsForRubyCredit,
} from "../shared/constants";
import { validateReactionType } from "../shared/utils/validators";
import { messagingOptions } from "../main/firebase";
import { getFileFromS3 } from "../shared/utils/s3";
import { getNotificationPayload } from "../shared/utils/functions";
import { postNotificationType } from "../shared/constants";

export const createPost: RequestHandler<any, SimpleRes, CreatePostReq> = async (
  req,
  res,
  next
) => {
  const { error } = validateCreatePostReq(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const userId = req["user"].id;

    const user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .send({ msg: "Cant't create post, user not found" });

    const { title, body } = req.body;

    const { name, studentData, school } = user;

    const userFullName = name.first + " " + name.last;
    const { department, faculty, level } = studentData;

    const searchText = `${title} ${name.first} ${name.last} ${school.fullName} ${school.shortName} ${department} ${faculty} ${level}`;

    const post = await new PostModel({
      creator: {
        id: userId,
        name: userFullName,
      },
      title,
      body,
      school,
      studentData,
      searchText,
    }).save();

    if (req["files"]) {
      for (let i = 0; i < req["files"].length; i++) {
        const file = req["files"][i];
        // Remove the folder name (post-images), leaving just the file name
        const filename = file.key.split("/")[1];

        await new SubPostModel({
          type: "Image",
          ppid: post._id,
          url: `${config.get("serverAddress")}/api/posts/images/${filename}`,
          dUrl: file.location,
        }).save();
      }
    }

    // Create notifications and notify departmental mates.
    const departmentalMates = await UserModel.find({
      "school.fullName": school.fullName,
      "studentData.faculty": faculty,
      "studentData.department": department,
      "studentData.level": level,
    }).select("_id name messagingToken");

    for (let depMate of departmentalMates) {
      const notification = new NotificationModel({
        creators: [
          {
            id: userId,
            name: `${name.first} ${name.last}`,
          },
        ],
        subscriber: { id: depMate._id },
        type: postNotificationType.createdPostNotification,
        phrase: "created a post",
        payload: getNotificationPayload(post.title),
      });

      await notification.save();

      const fcmPayload = {
        data: { msg: "PostCreated", status: "0", picture: "" },
      };

      // firebase
      //   .messaging()
      //   .sendToDevice(user.messagingToken, fcmPayload, messagingOptions);
    }

    res.status(201).send({ msg: "Post created successfully" });
  } catch (e) {
    next(new Error("Error in creating post: " + e));
  }
};

export const getPosts: RequestHandler<any, GetPostsRes, any, GetPostsQuery> =
  async (req, res, next) => {
    const userId = req["user"].id;
    const pageNumber = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;
    const { searchQuery } = req.query;

    try {
      const searchWords = searchQuery.split(" ");
      const schoolShortName = searchWords[0].toUpperCase();
      const remainingWords =
        searchWords.length == 1
          ? schoolShortName
          : searchWords.slice(1).join(" ");

      const posts = await PostModel.find({
        $and: [
          { "school.shortName": schoolShortName },
          { $text: { $search: `${remainingWords}` } },
        ],
      })
        // .skip((pageNumber - 1) * pageSize)
        // .limit(pageSize)
        .select("-__v -searchText -tags")
        .sort({ _id: -1 });

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
          title: p.title,
          body: p.body,
          subPosts: modifiedSubPosts,
          school: p.school,
          studentData: p.studentData,
          date: p.date,
          reactionCount: p.reactionCount ? p.reactionCount : 0,
          reaction: postReaction ? postReaction : { type: "", userId: "" },
          viewCount: p.viewCount,
          commentCount: p.commentCount,
        };

        modifiedPosts.push(modPost);
      }

      res.send({
        msg: "Posts fetched successfully",
        postCount: modifiedPosts.length,
        data: modifiedPosts,
      });
    } catch (e) {
      next(new Error("Error in getting posts: " + e));
    }
  };

export const getPostImage: RequestHandler<GetImageParams> = async (
  req,
  res,
  next
) => {
  try {
    const readStream = getFileFromS3("post-images", req.params.filename);

    readStream.pipe(res);
  } catch (e) {
    next(new Error("Error in getting image: " + e));
  }
};

export const reactToPost: RequestHandler<
  ReactToPostParams,
  SimpleRes,
  ReactToPostReq
> = async (req, res, next) => {
  try {
    const { error } = validateReactToPostParams(req.params);
    if (error) return res.status(400).send({ msg: error.details[0].message });

    const { reactionType } = req.body;
    const rxTypeIsValid = validateReactionType(reactionType);
    if (!rxTypeIsValid)
      return res.status(400).send({ msg: "Invalid reaction type" });

    const userId = req["user"].id;

    const user = await UserModel.findById(userId).select("_id name");
    const { name } = user;

    if (!user)
      return res.status(404).send({ msg: "No user with the given ID" });

    const { postId } = req.params;

    const post = await PostModel.findById(postId).select(
      "_id reactions creator title"
    );

    if (!post)
      return res.status(404).send({ msg: "No post with the given ID" });

    const reaction = post.reactions.find(
      (reaction: any) => reaction.userId.toHexString() === userId
    );

    if (reaction) {
      // If the user doesn't want to react anymore
      if (reaction.type === reactionType) {
        await PostModel.updateOne(
          { _id: postId },
          { $pull: { reactions: { userId } } }
        );
        await PostModel.updateOne(
          { _id: postId },
          { $inc: { reactionCount: -1 } }
        );
        // If the user changes their reaction.
      } else {
        await PostModel.updateOne(
          { _id: postId },
          { $pull: { reactions: { userId } } }
        );

        await PostModel.updateOne(
          { _id: postId },
          { $push: { reactions: { userId, type: reactionType } } }
        );
      }

      await new NotificationModel({
        creators: [
          {
            id: userId,
            name: `${name.first} ${name.last}`,
          },
        ],
        subscriber: { id: post.creator.id },
        type: postNotificationType.reactedToPostNotification,
        phrase: "reacted to",
        payload: getNotificationPayload(post.title),
      }).save();

      if (userId !== post.creator.id.toHexString()) {
        await new NotificationModel({
          creators: [
            {
              id: userId,
              name: `${name.first} ${name.last}`,
            },
          ],
          subscriber: { id: userId },
          type: postNotificationType.reactedToPostNotification,
          phrase: "reacted to",
          payload: getNotificationPayload(post.title),
        }).save();
      }

      return res.send({ msg: "Reacted to post successfully" });
    }

    // When the user reacts for the first time.
    await PostModel.updateOne(
      { _id: postId },
      { $push: { reactions: { userId, type: reactionType } } }
    );
    await PostModel.updateOne({ _id: postId }, { $inc: { reactionCount: 1 } });

    res.send({ msg: "Reacted to post successfully" });
  } catch (e) {
    next(new Error("Error in reacting to post: " + e));
  }
};

// TODO: Use a Transaction for this operation
export const viewPost: RequestHandler<ViewPostParams, SimpleRes> = async (
  req,
  res,
  next
) => {
  try {
    const { error } = validateViewPostReq(req.params);
    if (error) return res.status(400).send({ msg: error.details[0].message });

    const userId = req["user"].id;
    const { postId } = req.params;

    const user = await UserModel.findById(userId).select("_id");
    if (!user)
      return res.status(404).send({ msg: "No user with the given ID" });

    const post = await PostModel.findById(postId).select("-_id views creator");

    if (!post) return res.status(404).send({ msg: "No post found" });

    if (!post.views.find((id: string) => id === userId)) {
      await PostModel.updateOne(
        { _id: postId },
        { $addToSet: { views: userId } }
      );

      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        { $inc: { viewCount: 1 } },
        { new: true, useFindAndModify: false }
      ).select("viewCount -_id");

      const postViewCount = updatedPost.viewCount;
      if (postViewCount % maxViewsForRubyCredit === 0) {
        await UserModel.updateOne(
          { _id: post.creator.id },
          {
            $inc: { rubies: 1 },
          }
        );

        await new TransactionModel({
          receiver: post.creator.id,
          description: txDescription.contentCreation,
          amount: rubyCredit.contentCreation,
        }).save();
      }
    }

    res.send({ msg: "Post viewed successfully" });
  } catch (e) {
    next(new Error("Error in saving viewed post: " + e));
  }
};
