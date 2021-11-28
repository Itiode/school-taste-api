"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sub_comment_1 = require("../controllers/sub-comment");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.default)();
router.post("/", auth_1.default, sub_comment_1.addSubComment);
router.put("/react-to-sub-comment/:subCommentId", auth_1.default, sub_comment_1.reactToSubComment);
router.get("/:subPostId", auth_1.default, sub_comment_1.getSubComments);
exports.default = router;
