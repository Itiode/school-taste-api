import Router from "express";
import multer from "multer";

import { getStorageConfig } from "../shared/utils/s3";
const upload = multer({ storage: getStorageConfig("post-images") });

import {
  createPost,
  getPosts,
  getPostImage,
  reactToPost,
  viewPost,
} from "../controllers/post";
import auth from "../middleware/auth";

const router = Router();

router.post("/", auth, upload.array("post-images", 6), createPost);
router.get("/", auth, getPosts);
router.put("/react-to-post/:postId", auth, reactToPost);
router.put("/view-post/:postId", auth, viewPost);
router.get("/images/:filename", getPostImage);

export default router;
