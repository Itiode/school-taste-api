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
router.post('/check-for-username', userC.checkForUsername);
router.get("/me", auth, userC.getUser);
router.get("/:userId", auth, userC.getUser);
router.put(
  "/update-profile-image",
  auth,
  profileImgUpload.single("profile-image"),
  userC.updateProfileImage
);
router.put(
  "/update-cover-image",
  auth,
  coverImgUpload.single("cover-image"),
  userC.updateCoverImage
  );
  router.get("/profile-images/:filename", auth, userC.getProfileImage);
  router.get("/cover-images/:filename", auth, userC.getCoverImage);
  router.get("/ruby-balance/me", auth, userC.getRubyBalance);
  router.put("/update-about", auth, userC.updateAbout);
  router.put("/update-phone", auth, userC.updatePhone);
  router.put("/update-student-data", auth, userC.updateStudentData);
  router.put("/update-messaging-token", auth, userC.updateMessagingToken);
  router.put("/update-payment-details", auth, userC.updatePaymentDetails);

export default router;
