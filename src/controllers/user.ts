import config from "config";
import bcrypt from "bcryptjs";
import { RequestHandler } from "express";

import UserModel, {
  valAddUserReqBody,
  validateAboutData,
  validatePhoneData,
  valUpdateFacultyReqBody,
  valUpdateDepReqBody,
  validatePaymentDetailsData,
} from "../models/user";
import TransactionModel from "../models/transaction";
import NotificationModel from "../models/notification";
import {
  AddUserReqBody,
  AuthResBody,
  GetUserResBody,
  AboutData,
  PhoneData,
  UpdateFacultyReqBody,
  UpdateDepReqBody,
  UpdateMessagingTokenReqBody,
  PaymentDetails,
  VerifyUsernameReqBody,
  GetRubyBalanceResBody,
} from "../types/user";
import SchoolModel from "../models/student-data/school";
import FacultyModel from "../models/student-data/faculty";
import DepModel from "../models/student-data/department";
import { SimpleParams, SimpleRes, GetImageParams } from "../types/shared";
import { getFileFromS3 } from "../shared/utils/s3";

export const addUser: RequestHandler<any, AuthResBody, AddUserReqBody> = async (
  req,
  res,
  next
) => {
  const { error } = valAddUserReqBody(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  const {
    name,
    username,
    email,
    phone,
    dob,
    gender,
    schoolId,
    facultyId,
    departmentId,
    level,
    password,
  } = req.body;

  try {
    const fetchedUser = await UserModel.findOne({
      $or: [{ phone }, { email }, { username }],
    }).select("email phone username");

    if (fetchedUser) {
      if (fetchedUser.email === email) {
        return res.status(400).send({ msg: "This email exists already" });
      } else if (fetchedUser.phone === phone) {
        return res
          .status(400)
          .send({ msg: "This phone number exists already" });
      } else if (fetchedUser.username === username) {
        return res.status(400).send({ msg: "This username exists already" });
      }
    }

    const hashedPw = await bcrypt.hash(password, 10);

    const userImage = {
      original: { url: "", dUrl: "" },
      thumbnail: { url: "", dUrl: "" },
    };

    const school = await SchoolModel.findById(schoolId);
    if (!school) return res.status(404).send({ msg: "School not found" });

    const faculty = await FacultyModel.findById(facultyId);
    if (!faculty) return res.status(404).send({ msg: "Faculty not found" });

    const dep = await DepModel.findById(departmentId);
    if (!dep) return res.status(404).send({ msg: "Department not found" });

    const studentData = {
      school: {
        id: school._id,
        fullName: school.fullName,
        shortName: school.shortName,
      },
      faculty: {
        id: faculty._id,
        name: faculty.name,
      },
      department: {
        id: dep._id,
        name: dep.name,
      },
      level,
    };

    const user = await new UserModel({
      name,
      username,
      email,
      phone,
      dob,
      gender,
      about: `I'm a student of ${school.fullName}`,
      studentData,
      password: hashedPw,
      profileImage: userImage,
      coverImage: userImage,
    }).save();

    res.status(201).send({
      msg: "User added successfully",
      token: user.genAuthToken(),
    });
  } catch (e) {
    next(new Error("Error in adding user: " + e));
  }
};

// Get the currently logged in user or the user whose ID was
// provided.
export const getUser: RequestHandler<SimpleParams, GetUserResBody> = async (
  req,
  res,
  next
) => {
  let userId = req["user"].id;

  if (req.params.userId) userId = req.params.userId;

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
      profileImage,
      coverImage,
      about,
      gender,
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
        profileImage,
        coverImage,
        about,
        studentData,
        rubyBalance: req.params.userId ? 0 : rubyBalance,
      },
    });
  } catch (e) {
    next(new Error("Error in getting user: " + e));
  }
};

export const updateCoverImage: RequestHandler<any, SimpleRes> = async (
  req,
  res,
  next
) => {
  try {
    const userId = req["user"].id;

    // Remove the folder name (cover-images), leaving just the file name
    const filename = req["file"]!["key"].split("/")[1];

    const coverImage = {
      original: {
        url: `${config.get("serverAddress")}api/users/cover-images/${filename}`,
        dUrl: req["file"]!["location"],
      },
      thumbnail: {
        url: "",
        dUrl: "",
      },
    };

    await UserModel.updateOne({ _id: userId }, { $set: { coverImage } });

    // TODO: Delete previous cover images from AWS

    res.send({ msg: "Cover image updated successfully" });
  } catch (e) {
    next(new Error("Error in updating cover image: " + e));
  }
};

export const getCoverImage: RequestHandler<GetImageParams> = async (
  req,
  res,
  next
) => {
  try {
    const readStream = getFileFromS3("cover-images", req.params.filename);

    readStream.pipe(res);
  } catch (e) {
    next(new Error("Error in getting cover image: " + e));
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
    const filename = req["file"]!["key"].split("/")[1];

    const profileImage = {
      original: {
        url: `${config.get(
          "serverAddress"
        )}api/users/profile-images/${filename}`,
        dUrl: req["file"]!["location"],
      },
      thumbnail: {
        url: "",
        dUrl: "",
      },
    };

    await UserModel.updateOne({ _id: userId }, { $set: { profileImage } });

    // TODO: Delete previous profile images from AWS

    res.send({ msg: "Profile image updated successfully" });
  } catch (e) {
    next(new Error("Error in updating profile image: " + e));
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
    next(new Error("Error in getting profile image: " + e));
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

export const updatePhone: RequestHandler<any, SimpleRes, PhoneData> = async (
  req,
  res,
  next
) => {
  try {
    const { error } = validatePhoneData(req.body);
    if (error) return res.status(400).send({ msg: error.details[0].message });

    const userId = req["user"].id;
    await UserModel.updateOne(
      { _id: userId },
      { $set: { phone: req.body.phone } }
    );

    res.send({ msg: "Phone number updated successfully" });
  } catch (e) {
    next(new Error("Error in updating phone number: " + e));
  }
};

export const updateFaculty: RequestHandler<
  any,
  SimpleRes,
  UpdateFacultyReqBody
> = async (req, res, next) => {
  const { error } = valUpdateFacultyReqBody(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const userId = req["user"].id;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).send({ msg: "User not found" });

    const { facultyId } = req.body;

    const faculty = await FacultyModel.findById(facultyId);
    if (!faculty) return res.status(404).send({ msg: "Faculty not found" });

    await UserModel.updateOne(
      { _id: userId },
      { "studentData.faculty": { id: facultyId, name: faculty.name } }
    );

    res.send({ msg: "Faculty updated successfully" });
  } catch (e) {
    next(new Error("Error in updating faculty: " + e));
  }
};

export const updateDepartment: RequestHandler<
  any,
  SimpleRes,
  UpdateDepReqBody
> = async (req, res, next) => {
  const { error } = valUpdateDepReqBody(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const userId = req["user"].id;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).send({ msg: "User not found" });

    const { departmentId } = req.body;

    const dep = await DepModel.findById(departmentId);
    if (!dep) return res.status(404).send({ msg: "Department not found" });

    await UserModel.updateOne(
      { _id: userId },
      { "studentData.department": { id: departmentId, name: dep.name } }
    );

    res.send({ msg: "Department updated successfully" });
  } catch (e) {
    next(new Error("Error in updating department: " + e));
  }
};

export const updatePaymentDetails: RequestHandler<
  any,
  SimpleRes,
  PaymentDetails
> = async (req, res, next) => {
  const { error } = validatePaymentDetailsData(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const {
      bankName,
      bankSortCode,
      accountType,
      accountName,
      accountNumber,
      currency,
    } = req.body;
    const userId = req["user"].id;
    const user = await UserModel.findById(userId).select("_id");
    if (!user) return res.status(404).send({ msg: "User not found" });

    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          paymentDetails: {
            bankName,
            bankSortCode,
            accountType,
            accountName,
            accountNumber,
            currency,
          },
        },
      }
    );

    res.send({ msg: "Payment details updated successfully" });
  } catch (e) {
    next(new Error("Error in updating payment details: " + e));
  }
};

export const updateMessagingToken: RequestHandler<
  any,
  SimpleRes,
  UpdateMessagingTokenReqBody
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
    next(new Error("Error in saving messaging token: " + e));
  }
};

export const verifyUsername: RequestHandler<
  any,
  SimpleRes,
  VerifyUsernameReqBody
> = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({
      username: req.body.username,
    }).select("_id");

    if (user) return res.send({ msg: "FOUND" });
    res.send({ msg: "NOT_FOUND" });
  } catch (e) {
    next(new Error("Error in checking username: " + e));
  }
};

export const getRubyBalance: RequestHandler<
  any,
  GetRubyBalanceResBody | SimpleRes
> = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req["user"].id).select("rubyBalance");
    if (!user) return res.status(404).send({ msg: "User not found" });

    res.send({ msg: "Success", data: { balance: user.rubyBalance } });
  } catch (e) {
    next(new Error("Error in getting ruby balance: " + e));
  }
};
