import mongoose, { Schema } from "mongoose";
import config from "config";
import * as Jwt from "jsonwebtoken";
import Joi from "joi";

import { User, AddUserReq, AuthReq } from "../types/user";
import { UpdateStudentDataReq, AboutData } from "./../types/user";

const schema = new Schema<User>(
  {
    name: {
      first: {
        type: String,
        minLength: 2,
        maxLength: 25,
        trim: true,
        required: true,
      },
      last: {
        type: String,
        minLength: 2,
        maxLength: 25,
        trim: true,
        required: true,
      },
    },
    username: {
      type: String,
      trim: true,
      minLength: 2,
      maxLength: 25,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      minLength: 5,
      maxLength: 250,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      minLength: 11,
      maxLength: 11,
      unique: true,
      required: true,
    },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    dob: {
      day: {
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 2,
        required: true,
      },
      month: {
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 2,
        required: true,
      },
      year: {
        type: String,
        trim: true,
        minLength: 4,
        maxLength: 4,
        required: true,
      },
    },
    profileImage: {
      original: {
        url: { type: String, trim: true },
        dUrl: { type: String, trim: true },
      },
      thumbnail: {
        url: { type: String, trim: true },
        dUrl: { type: String, trim: true },
      },
    },
    about: { type: String, trim: true, minLength: 5, maxLength: 250 },
    school: {
      fullName: { type: String, trim: true, maxLength: 250, required: true },
      shortName: {
        type: String,
        trim: true,
        uppercase: true,
        maxLength: 25,
        required: true,
      },
    },
    studentData: {
      department: { type: String, trim: true, maxLength: 250, required: true },
      faculty: { type: String, trim: true, maxLength: 250, required: true },
      level: {
        type: String,
        trim: true,
        minLength: 3,
        maxLength: 3,
        required: true,
      },
    },
    password: { type: String, trim: true, required: true },
    interests: [String],
    hobbies: [String],
    roles: [String],
    rubies: { type: Number, min: 0, max: 1000, default: 1 },
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

export function validateAddUserReq(data: AddUserReq) {
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
      .regex(new RegExp("^[0-9]*$"))
      .required(),
    gender: Joi.string().trim().min(2).max(25).required(),
    dob: Joi.object({
      day: Joi.string().trim().max(2).required(),
      month: Joi.string().trim().max(2).required(),
      year: Joi.string().trim().min(4).max(4).required(),
    }),
    studentData: Joi.object({
      department: Joi.string().trim().max(250).required(),
      faculty: Joi.string().trim().max(250).required(),
      level: Joi.string().trim().min(3).max(3).required(),
    }),
    school: Joi.object({
      fullName: Joi.string().trim().max(250).required(),
      shortName: Joi.string().trim().uppercase().max(25).required(),
    }),
    password: Joi.string().trim().min(6).max(50).required(),
  });

  return schema.validate(data);
}

export function validateAuthReq(data: AuthReq) {
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
    about: Joi.string().trim().min(5).max(250).required(),
  }).validate(data);
}

export function validateUpdateStudentDataReq(data: UpdateStudentDataReq) {
  const schema = Joi.object({
    department: Joi.string().trim().max(250).required(),
    faculty: Joi.string().trim().max(250).required(),
    level: Joi.string().trim().min(3).max(3).required(),
  });

  return schema.validate(data);
}
