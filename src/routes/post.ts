import Router from "express";
import multer from "multer";

import { getStorageConfig } from "../shared/utils/s3";
const upload = multer({ storage: getStorageConfig("post-images") });

import * as pController from "../controllers/post";
import auth from "../middleware/auth";

const router = Router();

router.post("/", auth, upload.array("post-images", 6), pController.createPost);
router.get("/:postId", auth, pController.getPost);
router.get("/", auth, pController.getPosts);
router.put("/react-to-post/:postId", auth, pController.reactToPost);
router.put("/view-post/:postId", auth, pController.viewPost);
router.get("/images/:filename", pController.getPostImage);

export default router;
