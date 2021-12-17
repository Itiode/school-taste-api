import Router from "express";
import multer from "multer";

import { getStorageConfig } from "../shared/utils/s3";
const upload = multer({ storage: getStorageConfig("post-images") });

import * as pController from "../controllers/post";
import auth from "../middleware/auth";

const router = Router();

router.post("/", auth, upload.array("post-images", 10), pController.createPost);
router.get("/my", auth, pController.getMyPosts);
router.get("/:postId", auth, pController.getPost);
router.get("/", auth, pController.getAllPosts);
router.put("/react/:postId", auth, pController.reactToPost);
router.put("/view/:postId", auth, pController.viewPost);
router.get("/images/:filename", pController.getPostImage);

export default router;
