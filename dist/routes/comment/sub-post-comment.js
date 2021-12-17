"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sub_post_comment_1 = require("../../controllers/comment/sub-post-comment");
const auth_1 = __importDefault(require("../../middleware/auth"));
const router = (0, express_1.default)();
router.post("/", auth_1.default, sub_post_comment_1.addSubPostComment);
router.put("/react/:commentId", auth_1.default, sub_post_comment_1.reactToSubPostComment);
router.get("/:subPostId", auth_1.default, sub_post_comment_1.getSubPostComments);
exports.default = router;
