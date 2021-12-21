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
exports.validatePaymentDetailsData = exports.validateStudentData = exports.validatePhoneData = exports.validateAboutData = exports.validateAuthReq = exports.validateAddUserReq = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const config_1 = __importDefault(require("config"));
const Jwt = __importStar(require("jsonwebtoken"));
const joi_1 = __importDefault(require("joi"));
const name_1 = __importDefault(require("./schemas/name"));
const dob_1 = __importDefault(require("./schemas/dob"));
const school_1 = __importDefault(require("./schemas/school"));
const student_data_1 = __importDefault(require("./schemas/student-data"));
const user_image_1 = __importDefault(require("./schemas/user-image"));
const payment_details_1 = __importDefault(require("./schemas/payment-details"));
const schema = new mongoose_1.Schema({
    name: name_1.default,
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
    dob: dob_1.default,
    profileImage: user_image_1.default,
    coverImage: user_image_1.default,
    about: { type: String, trim: true, minLength: 1, maxLength: 250 },
    school: school_1.default,
    studentData: student_data_1.default,
    password: { type: String, trim: true, required: true },
    interests: [String],
    hobbies: [String],
    roles: [String],
    rubyBalance: { type: Number, min: 0, max: 1000, default: 1 },
    messagingToken: String,
    paymentDetails: payment_details_1.default,
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
function validateAddUserReq(data) {
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
        phone: joi_1.default.string()
            .trim()
            .min(11)
            .max(11)
            .regex(new RegExp("^[0-9]*$"))
            .required(),
        gender: joi_1.default.string().trim().min(2).max(25).required(),
        dob: joi_1.default.object({
            day: joi_1.default.string().trim().max(2).required(),
            month: joi_1.default.string().trim().max(2).required(),
            year: joi_1.default.string().trim().min(4).max(4).required(),
        }),
        studentData: joi_1.default.object({
            department: joi_1.default.string().trim().max(250).required(),
            faculty: joi_1.default.string().trim().max(250).required(),
            level: joi_1.default.string().trim().required(),
        }),
        school: joi_1.default.object({
            fullName: joi_1.default.string().trim().max(250).required(),
            shortName: joi_1.default.string().trim().uppercase().max(25).required(),
        }),
        password: joi_1.default.string().trim().min(6).max(50).required(),
    });
    return schema.validate(data);
}
exports.validateAddUserReq = validateAddUserReq;
function validateAuthReq(data) {
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
exports.validateAuthReq = validateAuthReq;
function validateAboutData(data) {
    return joi_1.default.object({
        about: joi_1.default.string().trim().max(250).required(),
    }).validate(data);
}
exports.validateAboutData = validateAboutData;
function validatePhoneData(data) {
    return joi_1.default.object({
        phone: joi_1.default.string()
            .trim()
            .min(11)
            .max(11)
            .regex(new RegExp("^[0-9]*$"))
            .required(),
    }).validate(data);
}
exports.validatePhoneData = validatePhoneData;
function validateStudentData(data) {
    const schema = joi_1.default.object({
        department: joi_1.default.string().trim().max(250).required(),
        faculty: joi_1.default.string().trim().max(250).required(),
        level: joi_1.default.string().trim().required(),
    });
    return schema.validate(data);
}
exports.validateStudentData = validateStudentData;
function validatePaymentDetailsData(data) {
    const schema = joi_1.default.object({
        bankName: joi_1.default.string().trim().max(500).required(),
        bankSortCode: joi_1.default.string().trim().max(5).required(),
        accountType: joi_1.default.string().trim().max(25).required(),
        accountName: joi_1.default.string().trim().max(250).required(),
        accountNumber: joi_1.default.string().trim().min(10).max(10).required(),
        currency: joi_1.default.string().min(2).max(5).required(),
    });
    return schema.validate(data);
}
exports.validatePaymentDetailsData = validatePaymentDetailsData;
