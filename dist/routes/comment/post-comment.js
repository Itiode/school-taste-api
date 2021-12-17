"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_comment_1 = require("../../controllers/comment/post-comment");
const auth_1 = __importDefault(require("../../middleware/auth"));
const router = (0, express_1.default)();
router.post('/', auth_1.default, post_comment_1.addPostComment);
router.put('/react/:commentId', auth_1.default, post_comment_1.reactToPostComment);
router.get('/:postId', auth_1.default, post_comment_1.getPostComments);
exports.default = router;
