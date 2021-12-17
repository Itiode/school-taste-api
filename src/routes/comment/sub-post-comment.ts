import Router from "express";

import {
  addSubPostComment,
  reactToSubPostComment,
  getSubPostComments,
} from "../../controllers/comment/sub-post-comment";
import auth from "../../middleware/auth";

const router = Router();

router.post("/", auth, addSubPostComment);
router.put("/react/:commentId", auth, reactToSubPostComment);
router.get("/:subPostId", auth, getSubPostComments);

export default router;