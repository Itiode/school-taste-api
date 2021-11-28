"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMessagingToken = exports.updateStudentData = exports.updateAbout = exports.getProfileImage = exports.updateProfileImage = exports.getUser = exports.addUser = void 0;
const config_1 = __importDefault(require("config"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importStar(require("../models/user"));
const s3_1 = require("../shared/utils/s3");
// TODO: Create a Transaction doc for the 1 free ruby signup bonus
const addUser = async (req, res, next) => {
    const { error } = (0, user_1.validateAddUserReq)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    const { name, username, email, phone, dob, gender, school, studentData, password, } = req.body;
    try {
        const fetchedUser = await user_1.default.findOne({
            $or: [{ phone }, { email }, { username }],
        });
        if (fetchedUser)
            return res.status(400).send({ msg: "User already registered" });
        const hashedPw = await bcryptjs_1.default.hash(password, 12);
        const user = await new user_1.default({
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
    }
    catch (e) {
        next(new Error("Error in adding user: " + e));
    }
};
exports.addUser = addUser;
const getUser = async (req, res, next) => {
    const userId = req["user"].id;
    try {
        const user = await user_1.default.findById(userId).select("-password -__v -createdAt -updatedAt");
        if (!user)
            return res.status(404).send({ msg: "User not found" });
        const { _id: id, name, username, email, phone, dob, gender, school, studentData, rubyBalance, } = user;
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
    }
    catch (e) {
        next(new Error("Error in getting user: " + e));
    }
};
exports.getUser = getUser;
const updateProfileImage = async (req, res, next) => {
    try {
        const userId = req["user"].id;
        // Remove the folder name (profile-images), leaving just the file name
        const filename = req["file"]["key"].split("/")[1];
        const profileImage = {
            original: {
                url: `${config_1.default.get("serverAddress")}/api/users/profile-images/${filename}`,
                dUrl: req["file"]["location"],
            },
        };
        await user_1.default.updateOne({ _id: userId }, { $set: { profileImage } });
        // TODO: Delete previous profile images from AWS
        res.send({ msg: "Profile picture updated successfully" });
    }
    catch (e) {
        next(new Error("Error in updating profile picture: " + e));
    }
};
exports.updateProfileImage = updateProfileImage;
const getProfileImage = async (req, res, next) => {
    try {
        const readStream = (0, s3_1.getFileFromS3)("profile-images", req.params.filename);
        readStream.pipe(res);
    }
    catch (e) {
        next(new Error("Error in getting image: " + e));
    }
};
exports.getProfileImage = getProfileImage;
const updateAbout = async (req, res, next) => {
    try {
        const { error } = (0, user_1.validateAboutData)(req.body);
        if (error)
            return res.status(400).send({ msg: error.details[0].message });
        const userId = req["user"].id;
        await user_1.default.updateOne({ _id: userId }, { $set: { about: req.body.about } });
        res.send({ msg: "About updated successfully" });
    }
    catch (e) {
        next(new Error("Error in updating about: " + e));
    }
};
exports.updateAbout = updateAbout;
const updateStudentData = async (req, res, next) => {
    const { error } = (0, user_1.validateUpdateStudentDataReq)(req.body);
    if (error)
        return { msg: error.details[0].message };
    const { department, faculty, level } = req.body;
    try {
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId).select("_id");
        if (!user)
            return res.status(404).send({ msg: "No user found" });
        await user_1.default.updateOne({ _id: userId }, { $set: { studentData: { department, faculty, level } } });
        res.send({ msg: "Student data updated successfully" });
    }
    catch (e) {
        next(new Error("Error in updating student data: " + e));
    }
};
exports.updateStudentData = updateStudentData;
const updateMessagingToken = async (req, res, next) => {
    try {
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId).select("_id");
        if (!user)
            return res.status(404).send({ msg: "No user found" });
        await user_1.default.updateOne({ _id: userId }, { $set: { messagingToken: req.body.messagingToken } });
        res.send({ msg: "Messaging token saved successfully" });
    }
    catch (e) {
        next(new Error("Error in saving messaging token"));
    }
};
exports.updateMessagingToken = updateMessagingToken;
