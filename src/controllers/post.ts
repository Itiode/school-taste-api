import config from "config";
import { RequestHandler } from "express";
import sizeOf from "image-size";
import * as firebase from "firebase-admin";

import PostModel, {
  valCreatePostReqBody,
  valCreateTextPostReqBody,
  validateReactToPostParams,
  getPosts,
} from "../models/post";
import NotificationModel, { shouldCreateNotif } from "../models/notification";
import SubPostModel from "../models/sub-post";
import UserModel from "../models/user";
import {
  Post,
  ModifiedPost,
  CreatePostReqBody,
  GetMyPostsParams,
  GetPostParams,
  GetPostsQuery,
  GetPostsResBody,
  GetPostResBody,
  ReactToPostParams,
  ReactToPostReq,
} from "../types/post";
import SubPost, { ModifiedSubPost } from "../types/sub-post";
import {
  SimpleRes,
  GetImageParams,
  Image,
  CompressedImage,
} from "../types/shared";
import { validateReactionType } from "../shared/utils/validators";
import { messagingOptions } from "../main/firebase";
import {
  delFileFromFS,
  getFileFromS3,
  uploadFileToS3,
} from "../shared/utils/s3";
import {
  compressImage,
  getNotificationPayload,
  getTextForIndexing,
} from "../shared/utils/functions";
import { formatDate } from "../shared/utils/functions";
import { postNotificationType, notificationPhrase } from "../shared/constants";
import { User } from "../types/user";

export const createTextPost: RequestHandler<
  any,
  SimpleRes,
  CreatePostReqBody
> = async (req, res, next) => {
  const { error } = valCreateTextPostReqBody(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const userId = req["user"].id;

    const user: User = await UserModel.findById(userId).select(
      "name studentData"
    );
    if (!user)
      return res.status(404).send({ msg: "Can't create post, user not found" });

    const { text } = req.body;

    const { name, studentData } = user;

    const { school, department, faculty, level } = studentData;

    const tagsString = `${name.first} ${name.last} ${school.fullName} ${
      school.shortName
    } ${department.name} ${faculty.name} ${level} ${getTextForIndexing(text)}`;

    const post = await new PostModel({
      creator: {
        id: userId,
      },
      text,
      studentData,
      tagsString,
    }).save();

    const notifType = postNotificationType.createdPostNotification;

    const shouldCreate = await shouldCreateNotif(userId, notifType);
    if (!shouldCreate)
      return res.status(201).send({ msg: "Post created successfully" });

    // Create notifications and notify departmental mates.
    const depMates = await UserModel.find({
      "studentData.school.id": school.id,
      "studentData.department.id": department.id,
      "studentData.level": level,
    }).select("_id name messagingToken");

    const notifs: any[] = [];
    const notifPayload = getNotificationPayload(post.text);

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
          type: notifType,
          phrase: notificationPhrase.created,
          contentId: post._id,
          payload: notifPayload,
        });

        notifs.push(notif);

        const fcmPayload = {
          data: {
            type: postNotificationType.createdPostNotification,
            title: `${name.first} ${name.last} created a post`,
            body: notifPayload,
            contentId: post._id.toHexString(),
          },
        };

        firebase
          .messaging()
          .sendToDevice(depMate.messagingToken, fcmPayload, messagingOptions);
      }
    }

    await NotificationModel.insertMany(notifs);

    res.status(201).send({ msg: "Post created successfully" });
  } catch (e) {
    next(new Error("Error in creating post: " + e));
  }
};

// TODO: USE A TRANSACTION TO CREATE A POST AND SUBPOSTS
export const createPost: RequestHandler<
  any,
  SimpleRes,
  CreatePostReqBody
> = async (req, res, next) => {
  const { error } = valCreatePostReqBody(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const userId = req["user"].id;

    const user: User = await UserModel.findById(userId).select(
      "name studentData"
    );
    if (!user)
      return res.status(404).send({ msg: "Can't create post, user not found" });

    const { text } = req.body;

    const { name, studentData } = user;

    const { school, department, faculty, level } = studentData;

    const tagsString = `${name.first} ${name.last} ${school.fullName} ${
      school.shortName
    } ${department.name} ${faculty.name} ${level} ${getTextForIndexing(text)}`;

    const post = await new PostModel({
      creator: {
        id: userId,
      },
      text,
      studentData,
      tagsString,
    }).save();

    let notifImageUrl = "";

    if (req["files"]) {
      for (let i = 0; i < req["files"].length; i++) {
        const file = req["files"][i];
        const filePath = file!.path;
        const filename = file!.filename;

        const imageSize = sizeOf(filePath);
        const imageWidth = imageSize.width!;
        const imageHeight = imageSize.height!;

        const thumbImg: CompressedImage = await compressImage(
          filePath,
          `thumbnail-${filename}`,
          {
            width: Math.round(imageWidth / 2 / 2),
            height: Math.round(imageHeight / 2 / 2),
          }
        );

        const uploadedThumbImg = await uploadFileToS3(
          "post-images",
          thumbImg.path,
          thumbImg.name
        );
        await delFileFromFS(thumbImg.path);

        const oriImg: CompressedImage = await compressImage(
          filePath,
          `original-${filename}`,
          {
            width: Math.round(imageWidth / 2),
            height: Math.round(imageHeight / 2),
          }
        );

        const uploadedOriImg = await uploadFileToS3(
          "post-images",
          oriImg.path,
          oriImg.name
        );
        await delFileFromFS(oriImg.path);

        // Delete the originally uploaded image
        await delFileFromFS(filePath);

        // Remove the folder name (post-images), leaving just the file name
        const uploadedThumbImgName = uploadedThumbImg["key"].split("/")[1];
        const uploadedOriImgName = uploadedOriImg["key"].split("/")[1];

        if (i === 0) {
          notifImageUrl = `${config.get(
            "serverAddress"
          )}api/posts/images/${uploadedOriImgName}`;
        }

        const item: Image = {
          thumbnail: {
            url: `${config.get(
              "serverAddress"
            )}api/posts/images/${uploadedThumbImgName}`,
            dUrl: uploadedThumbImg["Location"],
          },
          original: {
            url: `${config.get(
              "serverAddress"
            )}api/posts/images/${uploadedOriImgName}`,
            dUrl: uploadedOriImg["Location"],
          },
          metadata: { width: imageWidth, height: imageHeight },
        };

        await new SubPostModel({
          type: "image",
          ppid: post._id,
          item,
        }).save();
      }
    }

    const notifType = postNotificationType.createdPostNotification;

    const shouldCreate = await shouldCreateNotif(userId, notifType);
    if (!shouldCreate)
      return res.status(201).send({ msg: "Post created successfully" });

    // Create notifications and notify departmental mates.
    const depMates = await UserModel.find({
      "studentData.school.id": school.id,
      "studentData.department.id": department.id,
      "studentData.level": level,
    }).select("_id name messagingToken");

    const notifs: any[] = [];
    const notifPayload = getNotificationPayload(post.text);

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
          type: notifType,
          phrase: notificationPhrase.created,
          contentId: post._id,
          payload: notifPayload,
        });

        notifs.push(notif);

        const fcmPayload = {
          data: {
            type: postNotificationType.createdPostNotification,
            title: `${name.first} ${name.last} created a post`,
            body: notifPayload,
            contentId: post._id.toHexString(),
            imageUrl: notifImageUrl,
          },
        };

        firebase
          .messaging()
          .sendToDevice(depMate.messagingToken, fcmPayload, messagingOptions);
      }
    }

    await NotificationModel.insertMany(notifs);

    res.status(201).send({ msg: "Post created successfully" });
  } catch (e) {
    next(new Error("Error in creating post: " + e));
  }
};

// TODO: Create a reusable function for creating a mod post and sub posts
export const getPost: RequestHandler<GetPostParams, GetPostResBody> = async (
  req,
  res,
  next
) => {
  try {
    const post: Post = await PostModel.findById(req.params.postId).select(
      "-__v -tagsString -tags"
    );

    if (!post) res.status(404).send({ msg: "Post not found" });

    const subPosts: SubPost[] = await SubPostModel.find({
      ppid: post._id,
    }).select("-__v -views -dUrl");

    const userId = req["user"].id;

    const modSubPosts: ModifiedSubPost[] = [];
    for (const sP of subPosts) {
      const sPReaction = sP.reactions.find(
        (r: any) => r.userId.toHexString() === userId
      );

      modSubPosts.push({
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

    const postReaction = post.reactions.find(
      (r: any) => r.userId.toHexString() === userId
    );

    const creator = await UserModel.findById(post.creator.id).select(
      "name profileImage"
    );

    const modPost: ModifiedPost = {
      id: post._id,
      creator: {
        id: post.creator.id,
        name: creator.name.first + " " + creator.name.last,
        imageUrl: creator.profileImage.original.url,
      },
      text: post.text,
      subPosts: modSubPosts,
      studentData: post.studentData,
      date: post.date,
      formattedDate: formatDate(post.date.toString()),
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
export const getAllPosts: RequestHandler<
  any,
  GetPostsResBody,
  any,
  GetPostsQuery
> = async (req, res, next) => {
  const userId = req["user"].id;
  const pageNumber = +req.query.pageNumber;
  const pageSize = +req.query.pageSize;
  const { searchQuery, schoolId } = req.query;

  if (!(searchQuery || schoolId)) {
    return res
      .status(400)
      .send({ msg: "A search term or school ID must be provided" });
  }

  try {
    let posts: Post[];
    if (schoolId) {
      posts = await PostModel.find({ "studentData.school.id": schoolId })
        //   // .skip((pageNumber - 1) * pageSize)
        //   // .limit(pageSize)
        .select("-__v -tagsString -tags")
        .sort({ _id: -1 });
    } else {
      // TODO: Exclude -__v -tagsString -tags using the appropriate
      // aggregate operator
      posts = await PostModel.aggregate([
        { $match: { $text: { $search: searchQuery } } },
        { $sort: { score: { $meta: "textScore" } } },
      ]);
    }

    await getPosts(userId, posts, res);
  } catch (e) {
    next(new Error("Error in getting all posts: " + e));
  }
};

// TODO: Create a reusable function for creating a mod post and sub posts
export const getMyPosts: RequestHandler<
  GetMyPostsParams,
  GetPostsResBody,
  any,
  GetPostsQuery
> = async (req, res, next) => {
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
