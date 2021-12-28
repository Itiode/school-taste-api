import Router from "express";
import multer from "multer";

import { getStorageConfig } from "../shared/utils/s3";
const profileImgUpload = multer({
  storage: getStorageConfig("profile-images"),
});
const coverImgUpload = multer({ storage: getStorageConfig("cover-images") });

import * as userC from "../controllers/user";
import auth from "../middleware/auth";

const router = Router();

router.post("/", userC.addUser);
router.post("/verify-username", userC.verifyUsername);
router.get("/me", auth, userC.getUser);
router.get("/:userId", auth, userC.getUser);
router.put(
  "/profile-image/me",
  auth,
  profileImgUpload.single("profile-image"),
  userC.updateProfileImage
);
router.put(
  "/cover-image/me",
  auth,
  coverImgUpload.single("cover-image"),
  userC.updateCoverImage
);
router.get("/profile-images/:filename", auth, userC.getProfileImage);
router.get("/cover-images/:filename", auth, userC.getCoverImage);
router.get("/ruby-balance/me", auth, userC.getRubyBalance);
router.put("/about/me", auth, userC.updateAbout);
router.put("/phone/me", auth, userC.updatePhone);
router.put("/student-data/me", auth, userC.updateStudentData);
router.put("/messaging-token/me", auth, userC.updateMessagingToken);
router.put("/payment-details/me", auth, userC.updatePaymentDetails);

export default router;
