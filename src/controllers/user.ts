import config from "config";
import bcrypt from "bcryptjs";
import { RequestHandler } from "express";

import UserModel, {
  validateAddUserReq,
  validateUpdateStudentDataReq,
  validateAboutData,
} from "../models/user";
import {
  AddUserReq,
  AuthRes,
  GetUserRes,
  AboutData,
  UpdateStudentDataReq,
  UpdateMessagingTokenReq,
} from "../types/user";
import { SimpleRes, GetImageParams } from "../types/shared";
import { getFileFromS3 } from "../shared/utils/s3";

// TODO: Create a Transaction doc for the 1 free ruby signup bonus
export const addUser: RequestHandler<any, AuthRes, AddUserReq> = async (
  req,
  res,
  next
) => {
  const { error } = validateAddUserReq(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  const {
    name,
    username,
    email,
    phone,
    dob,
    gender,
    school,
    studentData,
    password,
  } = req.body;

  try {
    const fetchedUser = await UserModel.findOne({
      $or: [{ phone }, { email }, { username }],
    });

    if (fetchedUser)
      return res.status(400).send({ msg: "User already registered" });

    const hashedPw = await bcrypt.hash(password, 12);

    const user = await new UserModel({
      name,
      username,
      email,
      phone,
      dob,
      gender,
      about: `I'm a student of ${school.fullName}`,
      school,
      studentData,
      password: hashedPw,
    }).save();

    res.status(201).send({
      msg: "User added successfully",
      token: user.genAuthToken(),
    });
  } catch (e) {
    next(new Error("Error in adding user: " + e));
  }
};

export const getUser: RequestHandler<any, GetUserRes> = async (
  req,
  res,
  next
) => {
  const userId = req["user"].id;

  try {
    const user = await UserModel.findById(userId).select(
      "-password -__v -createdAt -updatedAt"
    );
    if (!user) return res.status(404).send({ msg: "User not found" });

    const {
      _id: id,
      name,
      username,
      email,
      phone,
      dob,
      gender,
      school,
      studentData,
      rubyBalance,
    } = user;

    res.send({
      msg: "User's data fetched successfully",
      data: {
        id,
        name,
        username,
        email,
        phone,
        gender,
        dob,
        school,
        studentData,
        rubyBalance,
      },
    });
  } catch (e) {
    next(new Error("Error in getting user: " + e));
  }
};

export const updateProfileImage: RequestHandler<any, SimpleRes> = async (
  req,
  res,
  next
) => {
  try {
    const userId = req["user"].id;

    // Remove the folder name (profile-images), leaving just the file name
    const filename = req["file"].key.split("/")[1];
    const profileImage = {
      original: {
        url: `${config.get(
          "serverAddress"
        )}/api/users/profile-images/${filename}`,
        dUrl: req["file"].location,
      },
    };

    await UserModel.updateOne({ _id: userId }, { $set: { profileImage } });

    // TODO: Delete previous profile images from AWS 

    res.send({ msg: "Profile picture updated successfully" });
  } catch (e) {
    next(new Error("Error in updating profile picture: " + e));
  }
};

export const getProfileImage: RequestHandler<GetImageParams> = async (
  req,
  res,
  next
) => {
  try {
    const readStream = getFileFromS3("profile-images", req.params.filename);

    readStream.pipe(res);
  } catch (e) {
    next(new Error("Error in getting image: " + e));
  }
};

export const updateAbout: RequestHandler<any, SimpleRes, AboutData> = async (
  req,
  res,
  next
) => {
  try {
    const { error } = validateAboutData(req.body);
    if (error) return res.status(400).send({ msg: error.details[0].message });

    const userId = req["user"].id;
    await UserModel.updateOne(
      { _id: userId },
      { $set: { about: req.body.about } }
    );

    res.send({ msg: "About updated successfully" });
  } catch (e) {
    next(new Error("Error in updating about: " + e));
  }
};

export const updateStudentData: RequestHandler<
  any,
  SimpleRes,
  UpdateStudentDataReq
> = async (req, res, next) => {
  const { error } = validateUpdateStudentDataReq(req.body);
  if (error) return { msg: error.details[0].message };

  const { department, faculty, level } = req.body;

  try {
    const userId = req["user"].id;

    const user = await UserModel.findById(userId).select("_id");
    if (!user) return res.status(404).send({ msg: "No user found" });

    await UserModel.updateOne(
      { _id: userId },
      { $set: { studentData: { department, faculty, level } } }
    );

    res.send({ msg: "Student data updated successfully" });
  } catch (e) {
    next(new Error("Error in updating student data: " + e));
  }
};

export const updateMessagingToken: RequestHandler<
  any,
  SimpleRes,
  UpdateMessagingTokenReq
> = async (req, res, next) => {
  try {
    const userId = req["user"].id;
    const user = await UserModel.findById(userId).select("_id");
    if (!user) return res.status(404).send({ msg: "No user found" });

    await UserModel.updateOne(
      { _id: userId },
      { $set: { messagingToken: req.body.messagingToken } }
    );

    res.send({ msg: "Messaging token saved successfully" });
  } catch (e) {
    next(new Error("Error in saving messaging token"));
  }
};
