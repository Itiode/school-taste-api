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
exports.getRubyBalance = exports.verifyUsername = exports.updateMessagingToken = exports.updatePaymentDetails = exports.updateStudentData = exports.updatePhone = exports.updateAbout = exports.getProfileImage = exports.updateProfileImage = exports.getCoverImage = exports.updateCoverImage = exports.getUser = exports.addUser = void 0;
const config_1 = __importDefault(require("config"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importStar(require("../models/user"));
const school_1 = __importDefault(require("../models/school/school"));
const s3_1 = require("../shared/utils/s3");
const addUser = async (req, res, next) => {
    const { error } = (0, user_1.validateAddUserData)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    const { name, username, email, phone, dob, gender, schoolId, studentData, password, } = req.body;
    try {
        const fetchedUser = await user_1.default.findOne({
            $or: [{ phone }, { email }, { username }],
        }).select("email phone username");
        if (fetchedUser.email === email) {
            return res.status(400).send({ msg: "This email exists already" });
        }
        else if (fetchedUser.phone === phone) {
            return res.status(400).send({ msg: "This phone number exists already" });
        }
        else if (fetchedUser.username === username) {
            return res.status(400).send({ msg: "This username exists already" });
        }
        const hashedPw = await bcryptjs_1.default.hash(password, 12);
        const userImage = {
            original: { url: "", dUrl: "" },
            thumbnail: { url: "", dUrl: "" },
        };
        const school = await school_1.default.findById(schoolId);
        if (!school)
            return res.status(404).send({ msg: "School not found" });
        const user = await new user_1.default({
            name,
            username,
            email,
            phone,
            dob,
            gender,
            about: `I'm a student of ${school.fullName}`,
            school: {
                id: school._id,
                fullName: school.fullName,
                shortName: school.shortName,
            },
            studentData,
            password: hashedPw,
            profileImage: userImage,
            coverImage: userImage,
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
// Get the currently logged in user or the user whose ID was
// provided.
const getUser = async (req, res, next) => {
    let userId = req["user"].id;
    if (req.params.userId)
        userId = req.params.userId;
    try {
        const user = await user_1.default.findById(userId).select("-password -__v -createdAt -updatedAt");
        if (!user)
            return res.status(404).send({ msg: "User not found" });
        const { _id: id, name, username, email, phone, dob, profileImage, coverImage, about, gender, school, studentData, rubyBalance, } = user;
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
                school,
                studentData,
                rubyBalance: req.params.userId ? 0 : rubyBalance,
            },
        });
    }
    catch (e) {
        next(new Error("Error in getting user: " + e));
    }
};
exports.getUser = getUser;
const updateCoverImage = async (req, res, next) => {
    try {
        const userId = req["user"].id;
        // Remove the folder name (cover-images), leaving just the file name
        const filename = req["file"]["key"].split("/")[1];
        const coverImage = {
            original: {
                url: `${config_1.default.get("serverAddress")}api/users/cover-images/${filename}`,
                dUrl: req["file"]["location"],
            },
            thumbnail: {
                url: "",
                dUrl: "",
            },
        };
        await user_1.default.updateOne({ _id: userId }, { $set: { coverImage } });
        // TODO: Delete previous cover images from AWS
        res.send({ msg: "Cover image updated successfully" });
    }
    catch (e) {
        next(new Error("Error in updating cover image: " + e));
    }
};
exports.updateCoverImage = updateCoverImage;
const getCoverImage = async (req, res, next) => {
    try {
        const readStream = (0, s3_1.getFileFromS3)("cover-images", req.params.filename);
        readStream.pipe(res);
    }
    catch (e) {
        next(new Error("Error in getting cover image: " + e));
    }
};
exports.getCoverImage = getCoverImage;
const updateProfileImage = async (req, res, next) => {
    try {
        const userId = req["user"].id;
        // Remove the folder name (profile-images), leaving just the file name
        const filename = req["file"]["key"].split("/")[1];
        const profileImage = {
            original: {
                url: `${config_1.default.get("serverAddress")}api/users/profile-images/${filename}`,
                dUrl: req["file"]["location"],
            },
            thumbnail: {
                url: "",
                dUrl: "",
            },
        };
        await user_1.default.updateOne({ _id: userId }, { $set: { profileImage } });
        // TODO: Delete previous profile images from AWS
        res.send({ msg: "Profile image updated successfully" });
    }
    catch (e) {
        next(new Error("Error in updating profile image: " + e));
    }
};
exports.updateProfileImage = updateProfileImage;
const getProfileImage = async (req, res, next) => {
    try {
        const readStream = (0, s3_1.getFileFromS3)("profile-images", req.params.filename);
        readStream.pipe(res);
    }
    catch (e) {
        next(new Error("Error in getting profile image: " + e));
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
const updatePhone = async (req, res, next) => {
    try {
        const { error } = (0, user_1.validatePhoneData)(req.body);
        if (error)
            return res.status(400).send({ msg: error.details[0].message });
        const userId = req["user"].id;
        await user_1.default.updateOne({ _id: userId }, { $set: { phone: req.body.phone } });
        res.send({ msg: "Phone number updated successfully" });
    }
    catch (e) {
        next(new Error("Error in updating phone number: " + e));
    }
};
exports.updatePhone = updatePhone;
const updateStudentData = async (req, res, next) => {
    const { error } = (0, user_1.validateStudentData)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const { department, faculty, level } = req.body;
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId).select("_id");
        if (!user)
            return res.status(404).send({ msg: "User not found" });
        await user_1.default.updateOne({ _id: userId }, { $set: { studentData: { department, faculty, level } } });
        res.send({ msg: "Student data updated successfully" });
    }
    catch (e) {
        next(new Error("Error in updating student data: " + e));
    }
};
exports.updateStudentData = updateStudentData;
const updatePaymentDetails = async (req, res, next) => {
    const { error } = (0, user_1.validatePaymentDetailsData)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const { bankName, bankSortCode, accountType, accountName, accountNumber, currency, } = req.body;
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId).select("_id");
        if (!user)
            return res.status(404).send({ msg: "User not found" });
        await user_1.default.updateOne({ _id: userId }, {
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
        });
        res.send({ msg: "Payment details updated successfully" });
    }
    catch (e) {
        next(new Error("Error in updating payment details: " + e));
    }
};
exports.updatePaymentDetails = updatePaymentDetails;
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
        next(new Error("Error in saving messaging token: " + e));
    }
};
exports.updateMessagingToken = updateMessagingToken;
const verifyUsername = async (req, res, next) => {
    try {
        const user = await user_1.default.findOne({
            username: req.body.username,
        }).select("_id");
        if (user)
            return res.send({ msg: "FOUND" });
        res.send({ msg: "NOT_FOUND" });
    }
    catch (e) {
        next(new Error("Error in checking username: " + e));
    }
};
exports.verifyUsername = verifyUsername;
const getRubyBalance = async (req, res, next) => {
    try {
        const user = await user_1.default.findById(req["user"].id).select("rubyBalance");
        if (!user)
            return res.status(404).send({ msg: "User not found" });
        res.send({ msg: "Success", data: { balance: user.rubyBalance } });
    }
    catch (e) {
        next(new Error("Error in getting ruby balance: " + e));
    }
};
exports.getRubyBalance = getRubyBalance;
