import Router from "express";

import auth from "../middleware/auth";
import { reactToSubPost } from "../controllers/sub-post";

const router = Router();

router.put("/react/:subPostId", auth, reactToSubPost);

export default router;
