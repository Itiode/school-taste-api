import Router from "express";

import {
  addSubComment,
  reactToSubComment,
  getSubComments,
} from "../controllers/sub-comment";
import auth from "../middleware/auth";

const router = Router();

router.post("/", auth, addSubComment);
router.put("/react-to-sub-comment/:subCommentId", auth, reactToSubComment);
router.get("/:subPostId", auth, getSubComments);

export default router;