import Router from "express";
import multer from "multer";

import storageConfig from "../shared/utils/s3";
const upload = multer({ storage: storageConfig });

import * as pController from "../controllers/post";
import auth from "../middleware/auth";

const router = Router();

router.post("/", auth, upload.array("post-images", 10), pController.createPost);
router.get("/me/:userId", auth, pController.getMyPosts);
router.get("/:postId", auth, pController.getPost);
router.get("/", auth, pController.getAllPosts);
router.put("/react/:postId", auth, pController.reactToPost);
router.put("/view/:postId", auth, pController.viewPost);
router.get("/images/:filename", pController.getPostImage);

export default router;
