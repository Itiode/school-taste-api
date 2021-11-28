"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comment_1 = require("../controllers/comment");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.default)();
router.post('/', auth_1.default, comment_1.addComment);
router.put('/react-to-comment/:commentId', auth_1.default, comment_1.reactToComment);
router.get('/:postId', auth_1.default, comment_1.getComments);
exports.default = router;
