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
const uC = __importStar(require("../controllers/user"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.default)();
router.post("/", uC.addUser);
router.get("/me", auth_1.default, uC.getUser);
router.get("/:userId", auth_1.default, uC.getUser);
router.post("/verify-username", uC.verifyUsername);
router.put("/profile-image/me", auth_1.default, profileImgUpload.single("profile-image"), uC.updateProfileImage);
router.put("/cover-image/me", auth_1.default, coverImgUpload.single("cover-image"), uC.updateCoverImage);
router.get("/profile-images/:filename", auth_1.default, uC.getProfileImage);
router.get("/cover-images/:filename", auth_1.default, uC.getCoverImage);
router.get("/ruby-balance/me", auth_1.default, uC.getRubyBalance);
router.put("/about/me", auth_1.default, uC.updateAbout);
router.put("/phone/me", auth_1.default, uC.updatePhone);
router.put("/faculty/me", auth_1.default, uC.updateFaculty);
router.put("/department/me", auth_1.default, uC.updateDepartment);
router.put("/level/me", auth_1.default, uC.updateLevel);
router.put("/messaging-token/me", auth_1.default, uC.updateMessagingToken);
router.put("/payment-details/me", auth_1.default, uC.updatePaymentDetails);
exports.default = router;
