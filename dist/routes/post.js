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
const upload = (0, multer_1.default)({ storage: (0, s3_1.getStorageConfig)("post-images") });
const pController = __importStar(require("../controllers/post"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.default)();
router.post("/", auth_1.default, upload.array("post-images", 10), pController.createPost);
router.get("/my", auth_1.default, pController.getMyPosts);
router.get("/:postId", auth_1.default, pController.getPost);
router.get("/", auth_1.default, pController.getAllPosts);
router.put("/react/:postId", auth_1.default, pController.reactToPost);
router.put("/view/:postId", auth_1.default, pController.viewPost);
router.get("/images/:filename", pController.getPostImage);
exports.default = router;
