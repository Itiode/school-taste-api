"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const sub_post_1 = require("../controllers/sub-post");
const router = (0, express_1.default)();
router.put("/react/:subPostId", auth_1.default, sub_post_1.reactToSubPost);
exports.default = router;
