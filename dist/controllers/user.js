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
exports.verifyUsername = exports.updateMessagingToken = exports.updateLevel = exports.updateDepartment = exports.updateFaculty = exports.getCourseMates = exports.updatePhone = exports.updateAbout = exports.getProfileImage = exports.updateProfileImage = exports.getCoverImage = exports.updateCoverImage = exports.getUser = exports.addUser = void 0;
const config_1 = __importDefault(require("config"));
const image_size_1 = __importDefault(require("image-size"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importStar(require("../models/user"));
const school_1 = __importDefault(require("../models/student-data/school"));
const faculty_1 = __importDefault(require("../models/student-data/faculty"));
const department_1 = __importDefault(require("../models/student-data/department"));
const s3_1 = require("../shared/utils/s3");
const functions_1 = require("../shared/utils/functions");
const addUser = async (req, res, next) => {
    const { error } = (0, user_1.valAddUserReqBody)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    const { name, username, email, phone, dob, gender, schoolId, facultyId, departmentId, level, password, } = req.body;
    try {
        const fetchedUser = await user_1.default.findOne({
            $or: [{ phone }, { email }, { username }],
        }).select("email phone username");
        if (fetchedUser) {
            if (fetchedUser.email === email) {
                return res.status(400).send({ msg: "This email exists already" });
            }
            else if (fetchedUser.phone === phone) {
                return res
                    .status(400)
                    .send({ msg: "This phone number exists already" });
            }
            else if (fetchedUser.username === username) {
                return res.status(400).send({ msg: "This username exists already" });
            }
        }
        const hashedPw = await bcryptjs_1.default.hash(password, 10);
        const userImage = {
            original: { url: "", dUrl: "" },
            thumbnail: { url: "", dUrl: "" },
        };
        const school = await school_1.default.findById(schoolId);
        if (!school)
            return res.status(404).send({ msg: "School not found" });
        const faculty = await faculty_1.default.findById(facultyId);
        if (!faculty)
            return res.status(404).send({ msg: "Faculty not found" });
        const dep = await department_1.default.findById(departmentId);
        if (!dep)
            return res.status(404).send({ msg: "Department not found" });
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
        const user = await new user_1.default({
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
        const { _id: id, name, username, email, phone, dob, profileImage, coverImage, about, gender, studentData, rubyBalance, } = user;
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
    }
    catch (e) {
        next(new Error("Error in getting user: " + e));
    }
};
exports.getUser = getUser;
const updateCoverImage = async (req, res, next) => {
    try {
        const userId = req["user"].id;
        const file = req["file"];
        const filePath = file.path;
        const filename = file.filename;
        const imageSize = (0, image_size_1.default)(filePath);
        const imageWidth = imageSize.width;
        const imageHeight = imageSize.height;
        const oriImg = await (0, functions_1.compressImage)(filePath, `original-${filename}`, {
            width: Math.round(imageWidth / 2),
            height: Math.round(imageHeight / 2),
        });
        const uploadedOriImg = await (0, s3_1.uploadFileToS3)("cover-images", oriImg.path, oriImg.name);
        await (0, s3_1.delFileFromFS)(oriImg.path);
        // Delete the originally uploaded image
        await (0, s3_1.delFileFromFS)(filePath);
        // Remove the folder name (cover-images), leaving just the filename
        const uploadedOriImgName = uploadedOriImg["key"].split("/")[1];
        const coverImage = {
            original: {
                url: `${config_1.default.get("serverAddress")}api/users/cover-images/${uploadedOriImgName}`,
                dUrl: uploadedOriImg["Location"],
            },
            thumbnail: {
                url: "",
                dUrl: "",
            },
            metadata: { width: imageWidth, height: imageHeight },
        };
        await user_1.default.updateOne({ _id: userId }, { $set: { coverImage } });
        // TODO: Delete previous cover image (original) from AWS
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
        const file = req["file"];
        const filePath = file.path;
        const filename = file.filename;
        const imageSize = (0, image_size_1.default)(filePath);
        const imageWidth = imageSize.width;
        const imageHeight = imageSize.height;
        const thumbImg = await (0, functions_1.compressImage)(filePath, `thumbnail-${filename}`, { width: 200, height: 200 });
        const uploadedThumbImg = await (0, s3_1.uploadFileToS3)("profile-images", thumbImg.path, thumbImg.name);
        await (0, s3_1.delFileFromFS)(thumbImg.path);
        const oriImg = await (0, functions_1.compressImage)(filePath, `original-${filename}`, {
            width: Math.round(imageWidth / 2),
            height: Math.round(imageHeight / 2),
        });
        const uploadedOriImg = await (0, s3_1.uploadFileToS3)("profile-images", oriImg.path, oriImg.name);
        await (0, s3_1.delFileFromFS)(oriImg.path);
        // Delete the originally uploaded image
        await (0, s3_1.delFileFromFS)(filePath);
        // Remove the folder name (profile-images), leaving just the file name
        const uploadedThumbImgName = uploadedThumbImg["key"].split("/")[1];
        const uploadedOriImgName = uploadedOriImg["key"].split("/")[1];
        const profileImage = {
            thumbnail: {
                url: `${config_1.default.get("serverAddress")}api/users/profile-images/${uploadedThumbImgName}`,
                dUrl: uploadedThumbImg["Location"],
            },
            original: {
                url: `${config_1.default.get("serverAddress")}api/users/profile-images/${uploadedOriImgName}`,
                dUrl: uploadedOriImg["Location"],
            },
            metadata: { width: imageWidth, height: imageHeight },
        };
        await user_1.default.updateOne({ _id: userId }, { $set: { profileImage } });
        // TODO: Delete previous profile images (original and thumbnail) from AWS
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
const getCourseMates = async (req, res, next) => {
    try {
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId).select("studentData");
        if (!user)
            return res.status(404).send({ msg: "User not found" });
        const courseMates = await user_1.default.find({
            $and: [
                { "studentData.school.id": user.studentData.school.id },
                { "studentData.department.id": user.studentData.department.id },
                { "studentData.level": user.studentData.level },
            ],
        })
            .select("name profileImage")
            .sort({ _id: -1 });
        const transformedCMs = [];
        for (let c of courseMates) {
            if (userId !== c._id.toHexString()) {
                const tCM = {
                    id: c._id,
                    fullName: `${c.name.first} ${c.name.last}`,
                    profileImageUrl: c.profileImage.original.url,
                };
                transformedCMs.push(tCM);
            }
        }
        res.send({
            msg: "Coursemates fetched successfully",
            data: transformedCMs,
        });
    }
    catch (e) {
        next(new Error("Error in getting coursemates: " + e));
    }
};
exports.getCourseMates = getCourseMates;
const updateFaculty = async (req, res, next) => {
    const { error } = (0, user_1.valUpdateFacultyReqBody)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId);
        if (!user)
            return res.status(404).send({ msg: "User not found" });
        const { facultyId } = req.body;
        const faculty = await faculty_1.default.findById(facultyId);
        if (!faculty)
            return res.status(404).send({ msg: "Faculty not found" });
        await user_1.default.updateOne({ _id: userId }, { "studentData.faculty": { id: facultyId, name: faculty.name } });
        res.send({ msg: "Faculty updated successfully" });
    }
    catch (e) {
        next(new Error("Error in updating faculty: " + e));
    }
};
exports.updateFaculty = updateFaculty;
const updateDepartment = async (req, res, next) => {
    const { error } = (0, user_1.valUpdateDepReqBody)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId);
        if (!user)
            return res.status(404).send({ msg: "User not found" });
        const { departmentId } = req.body;
        const dep = await department_1.default.findById(departmentId);
        if (!dep)
            return res.status(404).send({ msg: "Department not found" });
        await user_1.default.updateOne({ _id: userId }, { "studentData.department": { id: departmentId, name: dep.name } });
        res.send({ msg: "Department updated successfully" });
    }
    catch (e) {
        next(new Error("Error in updating department: " + e));
    }
};
exports.updateDepartment = updateDepartment;
const updateLevel = async (req, res, next) => {
    try {
        const { error } = (0, user_1.valUpdateLevelReqBody)(req.body);
        if (error)
            return res.status(400).send({ msg: error.details[0].message });
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId);
        if (!user)
            return res.status(404).send({ msg: "User not found" });
        await user_1.default.updateOne({ _id: userId }, { "studentData.level": req.body.level });
        res.send({ msg: "Level updated successfully" });
    }
    catch (e) {
        next(new Error("Error in updating level: " + e));
    }
};
exports.updateLevel = updateLevel;
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
