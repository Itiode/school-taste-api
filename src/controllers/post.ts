import config from "config";
import { RequestHandler } from "express";
import * as firebase from "firebase-admin";

import PostModel, {
  validateCreatePostReq,
  validateReactToPostParams,
  validateViewPostReq,
  getPosts,
} from "../models/post";
import NotificationModel from "../models/notification";
import SubPostModel from "../models/sub-post";
import UserModel from "../models/user";
import {
  PostRes,
  CreatePostReq,
  GetMyPostsParams,
  GetPostParams,
  GetPostsQuery,
  GetPostsRes,
  GetPostRes,
  ReactToPostParams,
  ReactToPostReq,
  ViewPostParams,
} from "../types/post";
import { SubPostRes } from "../types/sub-post";
import { SimpleRes, GetImageParams } from "../types/shared";
import TransactionModel from "../models/transaction";
import { txDesc, rubyCredit, maxViewsForRubyCredit } from "../shared/constants";
import { validateReactionType } from "../shared/utils/validators";
import { messagingOptions } from "../main/firebase";
import { getFileFromS3 } from "../shared/utils/s3";
import { getNotificationPayload } from "../shared/utils/functions";
import { formatDate } from "../shared/utils/functions";
import { postNotificationType, notificationPhrase } from "../shared/constants";

export const createPost: RequestHandler<any, SimpleRes, CreatePostReq> = async (
  req,
  res,
  next
) => {
  const { error } = validateCreatePostReq(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const userId = req["user"].id;

    const user = await UserModel.findById(userId).select(
      "name studentData school"
    );
    if (!user)
      return res.status(404).send({ msg: "Can't create post, user not found" });

    const { text } = req.body;

    const { name, studentData, school } = user;

    const { department, faculty, level } = studentData;

    const tagsString = `${name.first} ${name.last} ${school.fullName} ${school.shortName} ${department} ${faculty} ${level}`;

    const post = await new PostModel({
      creator: {
        id: userId,
      },
      text,
      school,
      studentData,
      tagsString,
    }).save();

    if (req["files"]) {
      for (let i = 0; i < req["files"].length; i++) {
        const file = req["files"][i];
        // Remove the folder name (post-images), leaving just the file name
        const filename = file.key.split("/")[1];

        await new SubPostModel({
          type: "Image",
          ppid: post._id,
          url: `${config.get("serverAddress")}api/posts/images/${filename}`,
          dUrl: file.location,
        }).save();
      }
    }

    // Create notifications and notify departmental mates.
    const depMates = await UserModel.find({
      "school.fullName": school.fullName,
      "studentData.faculty": faculty,
      "studentData.department": department,
      "studentData.level": level,
    }).select("_id name messagingToken");

    const notifs: any[] = [];

    for (let depMate of depMates) {
      if (depMate._id.toHexString() !== userId) {
        const notif = new NotificationModel({
          creators: [
            {
              id: userId,
              name: `${name.first} ${name.last}`,
            },
          ],
          subscriber: { id: depMate._id },
          type: postNotificationType.createdPostNotification,
          phrase: notificationPhrase.created,
          contentId: post._id,
          payload: getNotificationPayload(post.text),
        });

        notifs.push(notif);

        const fcmPayload = {
          data: { msg: "PostCreated", status: "0", picture: "" },
        };

        // firebase
        //   .messaging()
        //   .sendToDevice(user.messagingToken, fcmPayload, messagingOptions);
      }
    }

    await NotificationModel.insertMany(notifs);

    res.status(201).send({ msg: "Post created successfully" });
  } catch (e) {
    next(new Error("Error in creating post: " + e));
  }
};

// TODO: Create a reusable function for creating a mod post and sub posts
export const getPost: RequestHandler<GetPostParams, GetPostRes> = async (
  req,
  res,
  next
) => {
  try {
    const post = await PostModel.findById(req.params.postId).select(
      "-__v -tagsString -tags"
    );

    if (!post) res.status(404).send({ msg: "Post not found" });

    const subPosts = await SubPostModel.find({ ppid: post._id }).select(
      "-__v -views -dUrl"
    );

    const userId = req["user"].id;

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

    const postReaction = post.reactions.find(
      (r: any) => r.userId.toHexString() === userId
    );

    const creator = await UserModel.findById(post.creator.id).select(
      "name profileImage"
    );

    const modPost: PostRes = {
      id: post._id,
      creator: {
        id: post.creator.id,
        name: creator.name.first + " " + creator.name.last,
        imageUrl: creator.profileImage.original.url,
      },
      text: post.text,
      subPosts: modifiedSubPosts,
      school: post.school,
      studentData: post.studentData,
      date: post.date,
      formattedDate: formatDate(post.date),
      reactionCount: post.reactionCount ? post.reactionCount : 0,
      reaction: postReaction ? postReaction : { type: "", userId: "" },
      viewCount: post.viewCount,
      commentCount: post.commentCount,
    };

    res.send({ msg: "Post gotten successfully", data: modPost });
  } catch (e) {
    next(new Error("Error in getting post: " + e));
  }
};

// TODO: Create a reusable function for creating a mod post and sub posts
export const getAllPosts: RequestHandler<any, GetPostsRes, any, GetPostsQuery> =
  async (req, res, next) => {
    const userId = req["user"].id;
    const pageNumber = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;
    const { searchQuery } = req.query;

    try {
      const posts = await PostModel.find({
        $text: { $search: `${searchQuery}` },
      })
        // .skip((pageNumber - 1) * pageSize)
        // .limit(pageSize)
        .select("-__v -tagsString -tags")
        .sort({ _id: -1 });

      await getPosts(userId, posts, res);
    } catch (e) {
      next(new Error("Error in getting all posts: " + e));
    }
  };

// TODO: Create a reusable function for creating a mod post and sub posts
export const getMyPosts: RequestHandler<GetMyPostsParams, GetPostsRes, any, GetPostsQuery> =
  async (req, res, next) => {
    const userId = req.params.userId;
    const pageNumber = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;

    try {
      const posts = await PostModel.find({ "creator.id": userId })
        // .skip((pageNumber - 1) * pageSize)
        // .limit(pageSize)
        .select("-__v -tagsString -tags")
        .sort({ _id: -1 });

      await getPosts(userId, posts, res);
    } catch (e) {
      next(new Error("Error in getting user's posts: " + e));
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

    const reactingUserId = req["user"].id;

    const reactingUser = await UserModel.findById(reactingUserId).select(
      "_id name profileImage"
    );

    if (!reactingUser) return res.status(404).send({ msg: "User not found" });

    const { postId } = req.params;

    const post = await PostModel.findById(postId).select(
      "_id reactions creator text"
    );

    if (!post)
      return res.status(404).send({ msg: "No post with the given ID" });

    const reaction = post.reactions.find(
      (reaction: any) => reaction.userId.toHexString() === reactingUserId
    );

    if (reaction) {
      // If the user doesn't want to react anymore
      if (reaction.type === reactionType) {
        await PostModel.updateOne(
          { _id: postId },
          { $pull: { reactions: { userId: reactingUserId } } }
        );
        await PostModel.updateOne(
          { _id: postId },
          { $inc: { reactionCount: -1 } }
        );
        // If the user changes their reaction.
      } else {
        await PostModel.updateOne(
          { _id: postId },
          { $pull: { reactions: { userId: reactingUserId } } }
        );

        await PostModel.updateOne(
          { _id: postId },
          {
            $push: {
              reactions: { userId: reactingUserId, type: reactionType },
            },
          }
        );
      }

      return res.send({ msg: "Reacted to post successfully" });
    }

    // When the user reacts for the first time.
    await PostModel.updateOne(
      { _id: postId },
      { $push: { reactions: { userId: reactingUserId, type: reactionType } } }
    );
    await PostModel.updateOne({ _id: postId }, { $inc: { reactionCount: 1 } });

    if (reactingUserId !== post.creator.id.toHexString()) {
      const postOwner = await UserModel.findById(post.creator.id).select(
        "name"
      );
      const owners = [
        {
          id: post.creator.id,
          name: `${postOwner.name.first} ${postOwner.name.last}`,
        },
      ];

      const creators = [
        {
          id: reactingUserId,
          name: `${reactingUser.name.first} ${reactingUser.name.last}`,
        },
      ];

      const notifType = postNotificationType.reactedToPostNotification;
      const phrase = notificationPhrase.liked;
      const payload = getNotificationPayload(post.text);

      const existingNotif = await NotificationModel.findOne({
        contentId: postId,
        type: notifType,
      }).select("_id");

      if (!existingNotif) {
        await NotificationModel.insertMany([
          new NotificationModel({
            creators,
            owners,
            subscriber: { id: reactingUserId },
            type: notifType,
            phrase,
            payload,
            contentId: postId,
          }),
          new NotificationModel({
            creators,
            owners,
            subscriber: { id: post.creator.id },
            type: notifType,
            phrase,
            payload,
            contentId: postId,
          }),
        ]);
      }
    }

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
          description: txDesc.contentCreation,
          amount: rubyCredit.contentCreation,
        }).save();
      }
    }

    res.send({ msg: "Post viewed successfully" });
  } catch (e) {
    next(new Error("Error in saving viewed post: " + e));
  }
};
