import mongoose, { Schema } from "mongoose";
import config from "config";
import * as Jwt from "jsonwebtoken";
import Joi from "joi";

import { User, AddUserReq, AuthReq, PaymentDetails } from "../types/user";
import { UpdateStudentDataReq, AboutData, PhoneData } from "./../types/user";
import nameSchema from "./schemas/name";
import dobSchema from "./schemas/dob";
import studentDataSchema from "./schemas/student-data";
import userImageSchema from "./schemas/user-image";
import paymentDetailsSchema from "./schemas/payment-details";
import schoolSchema from "./schemas/school";

const schema = new Schema<User>(
  {
    name: nameSchema,
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
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dob: dobSchema,
    profileImage: userImageSchema,
    coverImage: userImageSchema,
    about: { type: String, trim: true, minLength: 1, maxLength: 200 },
    school: { type: schoolSchema, required: true },
    studentData: { type: studentDataSchema, required: true },
    password: { type: String, trim: true, required: true },
    interests: [String],
    hobbies: [String],
    roles: [String],
    rubyBalance: { type: Number, min: 0, max: 1000, default: 1 },
    messagingToken: String,
    paymentDetails: paymentDetailsSchema,
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

export function validateAddUserData(data: AddUserReq) {
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
      day: Joi.number().min(1).max(31).required(),
      month: Joi.number().min(1).max(12).required(),
      year: Joi.number().min(1980).max(2022).required(),
    }),
    schoolId: Joi.string()
      .trim()
      .regex(new RegExp("^[0-9a-fA-F]{24}$"))
      .required(),
    studentData: Joi.object({
      department: Joi.string().trim().max(250).required(),
      faculty: Joi.string().trim().max(250).required(),
      level: Joi.string().trim().required(),
    }),
    password: Joi.string().trim().min(6).max(50).required(),
  });

  return schema.validate(data);
}

export function validateAuthData(data: AuthReq) {
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
      .regex(new RegExp("^[0-9]*$"))
      .required(),
  }).validate(data);
}

export function validateStudentData(data: UpdateStudentDataReq) {
  const schema = Joi.object({
    department: Joi.string().trim().max(250).required(),
    faculty: Joi.string().trim().max(250).required(),
    level: Joi.string().trim().required(),
  });

  return schema.validate(data);
}

export function validatePaymentDetailsData(data: PaymentDetails) {
  const schema = Joi.object({
    bankName: Joi.string().trim().max(500).required(),
    bankSortCode: Joi.string().trim().max(5).required(),
    accountType: Joi.string().trim().max(25).required(),
    accountName: Joi.string().trim().max(200).required(),
    accountNumber: Joi.string().trim().min(10).max(10).required(),
    currency: Joi.string().min(2).max(5).required(),
  });

  return schema.validate(data);
}
