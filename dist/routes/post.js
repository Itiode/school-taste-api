"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const s3_1 = require("../shared/utils/s3");
const upload = (0, multer_1.default)({ storage: (0, s3_1.getStorageConfig)("post-images") });
const post_1 = require("../controllers/post");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.default)();
router.post("/", auth_1.default, upload.array("post-images", 6), post_1.createPost);
router.get("/", auth_1.default, post_1.getPosts);
router.put("/react-to-post/:postId", auth_1.default, post_1.reactToPost);
router.put("/view-post/:postId", auth_1.default, post_1.viewPost);
router.get("/images/:filename", post_1.getPostImage);
exports.default = router;
