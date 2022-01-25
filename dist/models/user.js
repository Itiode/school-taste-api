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
exports.valUpdateLevelReqBody = exports.valUpdateDepReqBody = exports.valUpdateFacultyReqBody = exports.validatePhoneData = exports.validateAboutData = exports.validateAuthData = exports.valAddUserReqBody = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const config_1 = __importDefault(require("config"));
const Jwt = __importStar(require("jsonwebtoken"));
const joi_1 = __importDefault(require("joi"));
const name_1 = __importDefault(require("./schemas/name"));
const dob_1 = __importDefault(require("./schemas/dob"));
const student_data_1 = __importDefault(require("./schemas/student-data"));
const image_1 = __importDefault(require("./schemas/image"));
const validators_1 = require("../shared/utils/validators");
const schema = new mongoose_1.Schema({
    name: name_1.default,
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
    dob: dob_1.default,
    profileImage: { type: image_1.default, required: true },
    coverImage: { type: image_1.default, required: true },
    about: { type: String, trim: true, minlength: 1, maxlength: 200 },
    studentData: { type: student_data_1.default, required: true },
    password: { type: String, trim: true, required: true },
    interests: [String],
    hobbies: [String],
    roles: [String],
    messagingToken: String,
}, { timestamps: true });
schema.methods.genAuthToken = function () {
    return Jwt.sign({
        id: this._id,
        phone: this.phone,
        email: this.email,
        username: this.username,
    }, config_1.default.get("jwtAuthPrivateKey"));
};
exports.default = mongoose_1.default.model("User", schema);
function valAddUserReqBody(data) {
    const schema = joi_1.default.object({
        name: joi_1.default.object({
            first: joi_1.default.string().trim().min(2).max(25).required(),
            last: joi_1.default.string().trim().min(2).max(25).required(),
        }),
        username: joi_1.default.string().trim().min(2).max(25).required(),
        email: joi_1.default.string()
            .min(5)
            .max(250)
            .email({ minDomainSegments: 2 })
            .required(),
        phone: validators_1.JoiValidators.phone.required(),
        gender: joi_1.default.string().trim().min(2).max(25).required(),
        dob: joi_1.default.object({
            day: joi_1.default.number().min(1).max(31).required(),
            month: joi_1.default.number().min(1).max(12).required(),
            year: joi_1.default.number().min(1980).max(2022).required(),
        }),
        schoolId: validators_1.JoiValidators.id.required(),
        facultyId: validators_1.JoiValidators.id.required(),
        departmentId: validators_1.JoiValidators.id.required(),
        levelId: validators_1.JoiValidators.id.required(),
        password: joi_1.default.string().trim().min(6).max(50).required(),
    });
    return schema.validate(data);
}
exports.valAddUserReqBody = valAddUserReqBody;
function validateAuthData(data) {
    const schema = joi_1.default.object({
        email: joi_1.default.string()
            .max(250)
            .trim()
            .email({ minDomainSegments: 2 })
            .required(),
        password: joi_1.default.string().min(6).max(50).trim().required(),
    });
    return schema.validate(data);
}
exports.validateAuthData = validateAuthData;
function validateAboutData(data) {
    return joi_1.default.object({
        about: joi_1.default.string().trim().max(250).required(),
    }).validate(data);
}
exports.validateAboutData = validateAboutData;
function validatePhoneData(data) {
    return joi_1.default.object({
        phone: validators_1.JoiValidators.phone.required(),
    }).validate(data);
}
exports.validatePhoneData = validatePhoneData;
function valUpdateFacultyReqBody(data) {
    return joi_1.default.object({
        facultyId: validators_1.JoiValidators.id.required(),
    }).validate(data);
}
exports.valUpdateFacultyReqBody = valUpdateFacultyReqBody;
function valUpdateDepReqBody(data) {
    return joi_1.default.object({
        departmentId: validators_1.JoiValidators.id.required(),
    }).validate(data);
}
exports.valUpdateDepReqBody = valUpdateDepReqBody;
function valUpdateLevelReqBody(data) {
    return joi_1.default.object({
        levelId: validators_1.JoiValidators.id.required(),
    }).validate(data);
}
exports.valUpdateLevelReqBody = valUpdateLevelReqBody;
