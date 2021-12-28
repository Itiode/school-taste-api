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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const s3_1 = require("../shared/utils/s3");
const profileImgUpload = (0, multer_1.default)({
    storage: (0, s3_1.getStorageConfig)("profile-images"),
});
const coverImgUpload = (0, multer_1.default)({ storage: (0, s3_1.getStorageConfig)("cover-images") });
const userC = __importStar(require("../controllers/user"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.default)();
router.post("/", userC.addUser);
router.post("/verify-username", userC.verifyUsername);
router.get("/me", auth_1.default, userC.getUser);
router.get("/:userId", auth_1.default, userC.getUser);
router.put("/profile-image/me", auth_1.default, profileImgUpload.single("profile-image"), userC.updateProfileImage);
router.put("/cover-image/me", auth_1.default, coverImgUpload.single("cover-image"), userC.updateCoverImage);
router.get("/profile-images/:filename", auth_1.default, userC.getProfileImage);
router.get("/cover-images/:filename", auth_1.default, userC.getCoverImage);
router.get("/ruby-balance/me", auth_1.default, userC.getRubyBalance);
router.put("/about/me", auth_1.default, userC.updateAbout);
router.put("/phone/me", auth_1.default, userC.updatePhone);
router.put("/student-data/me", auth_1.default, userC.updateStudentData);
router.put("/messaging-token/me", auth_1.default, userC.updateMessagingToken);
router.put("/payment-details/me", auth_1.default, userC.updatePaymentDetails);
exports.default = router;
