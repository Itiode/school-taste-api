import mongoose, { Schema } from "mongoose";
import config from "config";
import * as Jwt from "jsonwebtoken";
import Joi from "joi";

import {
  User,
  AddUserReqBody,
  AuthReqBody,
  UpdateFacultyReqBody,
  UpdateDepReqBody,
  UpdateLevelReqBody,
} from "../types/user";
import { AboutData, PhoneData } from "./../types/user";
import nameSchema from "./schemas/name";
import dobSchema from "./schemas/dob";
import studentDataSchema from "./schemas/student-data";
import imageSchema from "./schemas/image";

const schema = new Schema<User>(
  {
    name: nameSchema,
    username: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 25,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 250,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      minlength: 11,
      maxlength: 11,
      unique: true,
      required: true,
    },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    dob: dobSchema,
    profileImage: { type: imageSchema, required: true },
    coverImage: { type: imageSchema, required: true },
    about: { type: String, trim: true, minlength: 1, maxlength: 200 },
    studentData: { type: studentDataSchema, required: true },
    password: { type: String, trim: true, required: true },
    interests: [String],
    hobbies: [String],
    roles: [String],
    messagingToken: String,
  },
  { timestamps: true }
);

schema.methods.genAuthToken = function () {
  return Jwt.sign(
    {
      id: this._id,
      phone: this.phone,
      email: this.email,
      username: this.username,
    },
    config.get("jwtAuthPrivateKey")
  );
};

export default mongoose.model("User", schema);

export function valAddUserReqBody(data: AddUserReqBody) {
  const schema = Joi.object({
    name: Joi.object({
      first: Joi.string().trim().min(2).max(25).required(),
      last: Joi.string().trim().min(2).max(25).required(),
    }),
    username: Joi.string().trim().min(2).max(25).required(),
    email: Joi.string()
      .min(5)
      .max(250)
      .email({ minDomainSegments: 2 })
      .required(),
    phone: Joi.string()
      .trim()
      .min(11)
      .max(11)
      .pattern(new RegExp("^[0-9]*$"))
      .required(),
    gender: Joi.string().trim().min(2).max(25).required(),
    dob: Joi.object({
      day: Joi.number().min(1).max(31).required(),
      month: Joi.number().min(1).max(12).required(),
      year: Joi.number().min(1980).max(2022).required(),
    }),
    schoolId: Joi.string()
      .trim()
      .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
    facultyId: Joi.string()
      .trim()
      .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
    departmentId: Joi.string()
      .trim()
      .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
    level: Joi.string().trim().max(15).required(),
    password: Joi.string().trim().min(6).max(50).required(),
  });

  return schema.validate(data);
}

export function validateAuthData(data: AuthReqBody) {
  const schema = Joi.object({
    email: Joi.string()
      .max(250)
      .trim()
      .email({ minDomainSegments: 2 })
      .required(),
    password: Joi.string().min(6).max(50).trim().required(),
  });

  return schema.validate(data);
}

export function validateAboutData(data: AboutData) {
  return Joi.object({
    about: Joi.string().trim().max(250).required(),
  }).validate(data);
}

export function validatePhoneData(data: PhoneData) {
  return Joi.object({
    phone: Joi.string()
      .trim()
      .min(11)
      .max(11)
      .pattern(new RegExp("^[0-9]*$"))
      .required(),
  }).validate(data);
}

export function valUpdateFacultyReqBody(data: UpdateFacultyReqBody) {
  return Joi.object({
    facultyId: Joi.string()
      .trim()
      .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
  }).validate(data);
}

export function valUpdateDepReqBody(data: UpdateDepReqBody) {
  return Joi.object({
    departmentId: Joi.string()
      .trim()
      .pattern(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
  }).validate(data);
}

export function valUpdateLevelReqBody(data: UpdateLevelReqBody) {
  return Joi.object({
    level: Joi.string().trim().max(15).required(),
  }).validate(data);
}
