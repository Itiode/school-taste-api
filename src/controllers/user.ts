import config from "config";
import sizeOf from "image-size";
import bcrypt from "bcrypt";
import { RequestHandler } from "express";

import UserModel, {
  valAddUserReqBody,
  validateAboutData,
  validatePhoneData,
  valUpdateFacultyReqBody,
  valUpdateDepReqBody,
  valUpdateLevelReqBody,
} from "../models/user";
import {
  User,
  AddUserReqBody,
  AuthResBody,
  GetUserResBody,
  AboutData,
  PhoneData,
  UpdateFacultyReqBody,
  UpdateDepReqBody,
  UpdateLevelReqBody,
  UpdateMessagingTokenReqBody,
  VerifyUsernameReqBody,
  GetCourseMatesResBody,
} from "../types/user";
import SchoolModel from "../models/student-data/school";
import FacultyModel from "../models/student-data/faculty";
import DepModel from "../models/student-data/department";
import LevelModel from "../models/student-data/level";
import {
  SimpleParams,
  SimpleRes,
  GetImageParams,
  CourseMate,
  CompressedImage,
  Image,
  StudentData,
} from "../types/shared";
import {
  deleteFileFromFS,
  getFileFromS3,
  uploadFileToS3,
  deleteFileFromS3,
} from "../shared/utils/s3";
import { compressImage } from "../shared/utils/functions";

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
    levelId,
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

    const level = await LevelModel.findById(levelId);
    if (!level) return res.status(404).send({ msg: "Level not found" });

    const studentData: StudentData = {
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
      level: {
        id: level._id,
        name: level.name,
      },
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
    const user = await UserModel.findById(userId).select("coverImage");
    if (!user) return res.status(404).send({ msg: "User not found" });
    const prevImage: Image = user.coverImage;

    const file = req["file"];
    const filePath = file!.path;
    const filename = file!.filename;

    const imageSize = sizeOf(filePath);
    const imageWidth = imageSize.width!;
    const imageHeight = imageSize.height!;

    const oriImg: CompressedImage = await compressImage(
      filePath,
      `original-${filename}`,
      {
        width: Math.round(imageWidth / 2),
        height: Math.round(imageHeight / 2),
      }
    );

    const uploadedOriImg = await uploadFileToS3(
      "cover-images",
      oriImg.path,
      oriImg.name
    );
    await deleteFileFromFS(oriImg.path);

    // Delete the originally uploaded image
    await deleteFileFromFS(filePath);

    // Remove the folder name (cover-images), leaving just the filename
    const uploadedOriImgName = uploadedOriImg["key"].split("/")[1];

    const coverImage: Image = {
      original: {
        url: `${config.get(
          "serverAddress"
        )}api/users/cover-images/${uploadedOriImgName}`,
        dUrl: uploadedOriImg["Location"],
      },
      thumbnail: {
        url: "",
        dUrl: "",
      },
      metadata: { width: imageWidth, height: imageHeight },
    };

    await UserModel.updateOne({ _id: userId }, { $set: { coverImage } });

    // Delete previous cover images (original and thumbnail) from AWS
    if (prevImage.thumbnail.url) {
      const filename = prevImage.thumbnail.url.split("cover-images/")[1];
      await deleteFileFromS3("cover-images", filename);
    }

    if (prevImage.original.url) {
      const filename = prevImage.original.url.split("cover-images/")[1];
      await deleteFileFromS3("cover-images", filename);
    }

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
    const user = await UserModel.findById(userId).select("profileImage");
    if (!user) return res.status(404).send({ msg: "User not found" });
    const prevImage: Image = user.profileImage;

    const file = req["file"];
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
      "profile-images",
      thumbImg.path,
      thumbImg.name
    );
    await deleteFileFromFS(thumbImg.path);

    const oriImg: CompressedImage = await compressImage(
      filePath,
      `original-${filename}`,
      {
        width: Math.round(imageWidth / 2),
        height: Math.round(imageHeight / 2),
      }
    );

    const uploadedOriImg = await uploadFileToS3(
      "profile-images",
      oriImg.path,
      oriImg.name
    );
    await deleteFileFromFS(oriImg.path);

    // Delete the originally uploaded image
    await deleteFileFromFS(filePath);

    // Remove the folder name (profile-images), leaving just the file name
    const uploadedThumbImgName = uploadedThumbImg["key"].split("/")[1];
    const uploadedOriImgName = uploadedOriImg["key"].split("/")[1];

    const profileImage: Image = {
      thumbnail: {
        url: `${config.get(
          "serverAddress"
        )}api/users/profile-images/${uploadedThumbImgName}`,
        dUrl: uploadedThumbImg["Location"],
      },
      original: {
        url: `${config.get(
          "serverAddress"
        )}api/users/profile-images/${uploadedOriImgName}`,
        dUrl: uploadedOriImg["Location"],
      },
      metadata: { width: imageWidth, height: imageHeight },
    };

    await UserModel.updateOne({ _id: userId }, { $set: { profileImage } });

    // Delete previous profile images (original and thumbnail) from AWS
    if (prevImage.thumbnail.url) {
      const filename = prevImage.thumbnail.url.split("profile-images/")[1];
      await deleteFileFromS3("profile-images", filename);
    }

    if (prevImage.original.url) {
      const filename = prevImage.original.url.split("profile-images/")[1];
      await deleteFileFromS3("profile-images", filename);
    }

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

export const getCourseMates: RequestHandler<
  any,
  GetCourseMatesResBody
> = async (req, res, next) => {
  try {
    const userId = req["user"].id;
    const user: User = await UserModel.findById(userId).select("studentData");
    if (!user) return res.status(404).send({ msg: "User not found" });

    const courseMates = await UserModel.find({
      $and: [
        { "studentData.school.id": user.studentData.school.id },
        { "studentData.department.id": user.studentData.department.id },
        { "studentData.level": user.studentData.level },
      ],
    })
      .select("name profileImage")
      .sort({ _id: -1 });

    const transformedCMs: CourseMate[] = [];
    for (let c of courseMates) {
      if (userId !== c._id.toHexString()) {
        const tCM = {
          id: c._id,
          fullName: `${c.name.first} ${c.name.last}`,
          profileImageUrl: c.profileImage.thumbnail.url,
        };

        transformedCMs.push(tCM);
      }
    }

    res.send({
      msg: "Coursemates fetched successfully",
      data: transformedCMs,
    });
  } catch (e) {
    next(new Error("Error in getting coursemates: " + e));
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
      { "studentData.department": { id: dep._id, name: dep.name } }
    );

    res.send({ msg: "Department updated successfully" });
  } catch (e) {
    next(new Error("Error in updating department: " + e));
  }
};

export const updateLevel: RequestHandler<
  any,
  SimpleRes,
  UpdateLevelReqBody
> = async (req, res, next) => {
  try {
    const { error } = valUpdateLevelReqBody(req.body);
    if (error) return res.status(400).send({ msg: error.details[0].message });

    const userId = req["user"].id;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).send({ msg: "User not found" });

    const { levelId } = req.body;

    const lev = await LevelModel.findById(levelId);
    if (!lev) return res.status(404).send({ msg: "Level not found" });

    await UserModel.updateOne(
      { _id: userId },
      { "studentData.level": { id: lev._id, name: lev.name } }
    );

    res.send({ msg: "Level updated successfully" });
  } catch (e) {
    next(new Error("Error in updating level: " + e));
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
