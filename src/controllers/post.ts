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
  Post,
  PostRes,
  CreatePostReq,
  GetPostsQuery,
  GetPostsRes,
  GetPostParams,
  GetPostRes,
  ReactToPostParams,
  ReactToPostReq,
  ViewPostParams,
} from "../types/post";
import { SubPostRes } from "../types/sub-post";
import { Reaction } from "../types/shared";
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
import { formatDate } from "../shared/utils/date-format";
import { postNotificationType, notificationPhrase } from "../shared/constants";

export const createPost: RequestHandler<any, SimpleRes, CreatePostReq> = async (
  req,
  res,
  next
) => {
  const { error } = validateCreatePostReq(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const creatorId = req["user"].id;

    const user = await UserModel.findById(creatorId);
    if (!user)
      return res
        .status(404)
        .send({ msg: "Cant't create post, user not found" });

    const { title, body } = req.body;

    const { name, studentData, school, profileImage } = user;

    const userFullName = name.first + " " + name.last;
    const { department, faculty, level } = studentData;

    const searchText = `${title} ${name.first} ${name.last} ${school.fullName} ${school.shortName} ${department} ${faculty} ${level}`;

    const post = await new PostModel({
      creator: {
        id: creatorId,
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
    }).select("_id name messagingToken profileImage");

    for (let depMate of depMates) {
      if (depMate._id.toHexString() !== creatorId) {
        const notification = new NotificationModel({
          creators: [
            {
              id: creatorId,
              name: `${name.first} ${name.last}`,
            },
          ],
          subscriber: { id: depMate._id },
          type: postNotificationType.createdPostNotification,
          phrase: notificationPhrase.created,
          contentId: post._id,
          payload: getNotificationPayload(post.title),
          image: { thumbnail: { url: profileImage.original.url } },
        });

        await notification.save();

        const fcmPayload = {
          data: { msg: "PostCreated", status: "0", picture: "" },
        };

        // firebase
        //   .messaging()
        //   .sendToDevice(user.messagingToken, fcmPayload, messagingOptions);
      }
    }

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
    const userId = req["user"].id;
    const user = await UserModel.findById(userId).select("_id");
    if (!user)
      return res.status(404).send({ msg: "No user with the given ID" });

    const post = await PostModel.findById(req.params.postId).select(
      "-__v -searchText -tags"
    );

    if (!post) res.status(404).send({ msg: "No post with the given ID" });

    const subPosts = await SubPostModel.find({ ppid: post._id }).select(
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

    const postReaction = post.reactions.find(
      (r: any) => r.userId.toHexString() === userId
    );

    const modPost = {
      id: post._id,
      creator: post.creator,
      title: post.title,
      body: post.body,
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

      await getPosts(userId, posts, res);
    } catch (e) {
      next(new Error("Error in getting all posts: " + e));
    }
  };

// TODO: Create a reusable function for creating a mod post and sub posts
export const getMyPosts: RequestHandler<any, GetPostsRes, any, GetPostsQuery> =
  async (req, res, next) => {
    const userId = req["user"].id;
    const pageNumber = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;

    try {
      const posts = await PostModel.findById(userId)
        // .skip((pageNumber - 1) * pageSize)
        // .limit(pageSize)
        .select("-__v -searchText -tags")
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

    if (!reactingUser)
      return res.status(404).send({ msg: "No user with the given ID" });

    const { postId } = req.params;

    const post = await PostModel.findById(postId).select(
      "_id reactions creator title"
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
          { $pull: { reactions: { reactingUserId } } }
        );
        await PostModel.updateOne(
          { _id: postId },
          { $inc: { reactionCount: -1 } }
        );
        // If the user changes their reaction.
      } else {
        await PostModel.updateOne(
          { _id: postId },
          { $pull: { reactions: { reactingUserId } } }
        );

        await PostModel.updateOne(
          { _id: postId },
          { $push: { reactions: { reactingUserId, type: reactionType } } }
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
      const payload = getNotificationPayload(post.title);
      const image = {
        thumbnail: { url: reactingUser.profileImage.original.url },
      };

      await new NotificationModel({
        creators,
        owners,
        subscriber: { id: reactingUserId },
        type: notifType,
        phrase,
        payload,
        contentId: postId,
        image,
      }).save();

      await new NotificationModel({
        creators,
        owners,
        subscriber: { id: post.creator.id },
        type: notifType,
        phrase,
        payload,
        contentId: postId,
        image,
      }).save();
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
