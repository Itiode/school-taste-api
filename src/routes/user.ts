import Router from "express";
import multer from "multer";

import { getStorageConfig } from "../shared/utils/s3";
const upload = multer({ storage: getStorageConfig("profile-images") });

import {
  addUser,
  getUser,
  getProfileImage,
  updateProfileImage,
  updateAbout,
  updateStudentData,
  updateMessagingToken,
} from "../controllers/user";
import auth from "../middleware/auth";

const router = Router();

router.post("/", addUser);
router.get("/me", auth, getUser);
router.put(
  "/update-profile-image",
  auth,
  upload.single("profile-image"),
  updateProfileImage
);
router.get("/profile-images/:filename", auth, getProfileImage);
router.put("/update-about", auth, updateAbout);
router.put("/update-student-data", auth, updateStudentData);
router.put("/update-messaging-token", auth, updateMessagingToken);

export default router;
